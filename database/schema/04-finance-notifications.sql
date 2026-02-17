-- =====================================================
-- Finance Management & Advanced Notification System
-- =====================================================

-- =====================================================
-- 1. FINANCIAL REPORTING VIEWS
-- =====================================================

-- View for scholarship financial summary
CREATE OR REPLACE VIEW v_scholarship_financial_summary AS
SELECT 
    s.id,
    s.name,
    s.academic_year,
    s.department,
    s.total_funding,
    s.amount as per_recipient_amount,
    s.max_recipients,
    s.current_recipients,
    (s.current_recipients * s.amount) as allocated_amount,
    (s.total_funding - (s.current_recipients * s.amount)) as remaining_funding,
    ROUND(((s.current_recipients * s.amount) / s.total_funding * 100), 2) as utilization_percentage,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as payments_completed,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_disbursed
FROM scholarships s
LEFT JOIN applications a ON s.id = a.scholarship_id
LEFT JOIN payments p ON a.id = p.application_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.name, s.academic_year, s.department, s.total_funding, 
         s.amount, s.max_recipients, s.current_recipients;

-- View for payment processing queue
CREATE OR REPLACE VIEW v_payment_processing_queue AS
SELECT 
    p.id as payment_id,
    p.reference_number,
    p.amount,
    p.status,
    p.scheduled_date,
    p.created_at,
    s.name as scholarship_name,
    s.academic_year,
    CONCAT(u.first_name, ' ', u.last_name) as student_name,
    u.email as student_email,
    st.student_id,
    st.bank_account_number,
    st.bank_name,
    st.account_holder_name,
    CASE 
        WHEN p.scheduled_date < CURRENT_DATE THEN 'Overdue'
        WHEN p.scheduled_date = CURRENT_DATE THEN 'Due Today'
        WHEN p.scheduled_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Due Soon'
        ELSE 'Scheduled'
    END as urgency_status
FROM payments p
JOIN applications a ON p.application_id = a.id
JOIN students st ON a.student_id = st.id
JOIN users u ON st.user_id = u.id
JOIN scholarships s ON a.scholarship_id = s.id
WHERE p.status IN ('pending', 'approved')
ORDER BY p.scheduled_date ASC, p.created_at ASC;

-- View for financial audit trail
CREATE OR REPLACE VIEW v_financial_audit_trail AS
SELECT 
    p.id as payment_id,
    p.reference_number,
    p.amount,
    p.status,
    p.created_at as payment_created,
    p.processed_at,
    p.completed_at,
    CONCAT(processor.first_name, ' ', processor.last_name) as processed_by_name,
    CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name,
    s.name as scholarship_name,
    CONCAT(student.first_name, ' ', student.last_name) as student_name,
    st.student_id,
    a.id as application_id,
    a.decision_date as application_approved_date,
    EXTRACT(DAYS FROM (p.completed_at - a.decision_date)) as processing_days
FROM payments p
JOIN applications a ON p.application_id = a.id
JOIN students st ON a.student_id = st.id
JOIN users student ON st.user_id = student.id
JOIN scholarships s ON a.scholarship_id = s.id
LEFT JOIN users processor ON p.processed_by = processor.id
LEFT JOIN users approver ON p.approved_by = approver.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at DESC;

-- =====================================================
-- 2. ADVANCED NOTIFICATION SYSTEM
-- =====================================================

-- Table for notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names used in template
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default notification templates
INSERT INTO notification_templates (name, type, subject_template, body_template, variables) VALUES
('application_submitted', 'application_submitted', 
 'Application Submitted: {{scholarship_name}}',
 'Dear {{student_name}}, your application for "{{scholarship_name}}" has been successfully submitted on {{submission_date}}. You will receive updates as your application progresses through the review process.',
 '["student_name", "scholarship_name", "submission_date"]'),

('application_approved', 'application_approved',
 'Congratulations! Scholarship Approved: {{scholarship_name}}',
 'Dear {{student_name}}, we are pleased to inform you that your application for "{{scholarship_name}}" has been approved for an amount of ${{amount}}. Payment processing will begin shortly.',
 '["student_name", "scholarship_name", "amount"]'),

('payment_scheduled', 'payment_processed',
 'Scholarship Payment Scheduled: {{reference_number}}',
 'Dear {{student_name}}, your scholarship payment of ${{amount}} has been scheduled for {{scheduled_date}}. Reference number: {{reference_number}}.',
 '["student_name", "amount", "scheduled_date", "reference_number"]'),

('deadline_reminder_7days', 'deadline_reminder',
 'Reminder: Application Deadline in 7 Days - {{scholarship_name}}',
 'Dear {{student_name}}, this is a reminder that the application deadline for "{{scholarship_name}}" is in 7 days ({{deadline_date}}). Don''t miss this opportunity!',
 '["student_name", "scholarship_name", "deadline_date"]'),

('deadline_reminder_1day', 'deadline_reminder',
 'URGENT: Application Deadline Tomorrow - {{scholarship_name}}',
 'Dear {{student_name}}, the application deadline for "{{scholarship_name}}" is tomorrow ({{deadline_date}}). Submit your application now to avoid missing out!',
 '["student_name", "scholarship_name", "deadline_date"]');

-- Table for scheduled notifications
CREATE TABLE scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL REFERENCES notification_templates(name),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_scheduled_notification_status CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);

-- =====================================================
-- 3. DEADLINE REMINDER SYSTEM
-- =====================================================

-- Function to schedule deadline reminders for active scholarships
CREATE OR REPLACE FUNCTION schedule_deadline_reminders()
RETURNS INTEGER AS $$
DECLARE
    scholarship_rec RECORD;
    student_rec RECORD;
    reminder_count INTEGER := 0;
BEGIN
    -- Loop through active scholarships with upcoming deadlines
    FOR scholarship_rec IN 
        SELECT id, name, application_deadline
        FROM scholarships 
        WHERE status = 'active' 
        AND application_deadline > CURRENT_DATE
        AND application_deadline <= CURRENT_DATE + INTERVAL '30 days'
    LOOP
        -- Schedule 7-day reminders
        IF scholarship_rec.application_deadline = CURRENT_DATE + INTERVAL '7 days' THEN
            -- Get eligible students who haven't applied yet
            FOR student_rec IN
                SELECT DISTINCT u.id as user_id, u.first_name, u.last_name
                FROM users u
                JOIN students s ON u.id = s.user_id
                WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
                AND u.is_active = true
                AND NOT EXISTS (
                    SELECT 1 FROM applications a 
                    WHERE a.student_id = s.id 
                    AND a.scholarship_id = scholarship_rec.id
                )
            LOOP
                INSERT INTO scheduled_notifications (
                    template_name, user_id, scheduled_for, data
                ) VALUES (
                    'deadline_reminder_7days',
                    student_rec.user_id,
                    CURRENT_TIMESTAMP,
                    jsonb_build_object(
                        'student_name', student_rec.first_name || ' ' || student_rec.last_name,
                        'scholarship_name', scholarship_rec.name,
                        'deadline_date', scholarship_rec.application_deadline
                    )
                );
                reminder_count := reminder_count + 1;
            END LOOP;
        END IF;
        
        -- Schedule 1-day reminders
        IF scholarship_rec.application_deadline = CURRENT_DATE + INTERVAL '1 day' THEN
            FOR student_rec IN
                SELECT DISTINCT u.id as user_id, u.first_name, u.last_name
                FROM users u
                JOIN students s ON u.id = s.user_id
                WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
                AND u.is_active = true
                AND NOT EXISTS (
                    SELECT 1 FROM applications a 
                    WHERE a.student_id = s.id 
                    AND a.scholarship_id = scholarship_rec.id
                )
            LOOP
                INSERT INTO scheduled_notifications (
                    template_name, user_id, scheduled_for, data
                ) VALUES (
                    'deadline_reminder_1day',
                    student_rec.user_id,
                    CURRENT_TIMESTAMP,
                    jsonb_build_object(
                        'student_name', student_rec.first_name || ' ' || student_rec.last_name,
                        'scholarship_name', scholarship_rec.name,
                        'deadline_date', scholarship_rec.application_deadline
                    )
                );
                reminder_count := reminder_count + 1;
            END LOOP;
        END IF;
    END LOOP;
    
    RETURN reminder_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. PAYMENT BATCH PROCESSING
-- =====================================================

-- Table for payment batches
CREATE TABLE payment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    CONSTRAINT chk_payment_batch_status CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed'))
);

-- Add batch_id to payments table (already exists in schema)
-- ALTER TABLE payments ADD COLUMN batch_id UUID REFERENCES payment_batches(id);

-- Function to create payment batch
CREATE OR REPLACE FUNCTION create_payment_batch(
    p_payment_ids UUID[],
    p_created_by UUID,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    batch_id UUID;
    batch_number VARCHAR(50);
    total_amount DECIMAL(12,2);
    payment_count INTEGER;
BEGIN
    -- Generate batch number
    batch_number := 'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                   LPAD(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER % 10000, 4, '0');
    
    -- Calculate totals
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO payment_count, total_amount
    FROM payments
    WHERE id = ANY(p_payment_ids)
    AND status = 'pending';
    
    -- Create batch
    INSERT INTO payment_batches (
        batch_number, total_amount, payment_count, created_by, notes
    ) VALUES (
        batch_number, total_amount, payment_count, p_created_by, p_notes
    ) RETURNING id INTO batch_id;
    
    -- Update payments with batch_id
    UPDATE payments 
    SET batch_id = batch_id,
        status = 'approved'
    WHERE id = ANY(p_payment_ids)
    AND status = 'pending';
    
    RETURN batch_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FINANCIAL REPORTING FUNCTIONS
-- =====================================================

-- Function to generate monthly financial report
CREATE OR REPLACE FUNCTION generate_monthly_financial_report(
    p_year INTEGER,
    p_month INTEGER
) RETURNS TABLE (
    scholarship_name VARCHAR(200),
    department VARCHAR(100),
    applications_received BIGINT,
    applications_approved BIGINT,
    total_awarded DECIMAL(12,2),
    total_disbursed DECIMAL(12,2),
    pending_disbursement DECIMAL(12,2),
    approval_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.name,
        s.department,
        COUNT(a.id) as applications_received,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as applications_approved,
        COALESCE(SUM(CASE WHEN a.status = 'approved' THEN s.amount ELSE 0 END), 0) as total_awarded,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_disbursed,
        COALESCE(SUM(CASE WHEN a.status = 'approved' AND p.status != 'completed' THEN s.amount ELSE 0 END), 0) as pending_disbursement,
        CASE 
            WHEN COUNT(a.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN a.status = 'approved' THEN 1 END)::DECIMAL / COUNT(a.id) * 100), 2)
            ELSE 0 
        END as approval_rate
    FROM scholarships s
    LEFT JOIN applications a ON s.id = a.scholarship_id 
        AND EXTRACT(YEAR FROM a.submitted_at) = p_year
        AND EXTRACT(MONTH FROM a.submitted_at) = p_month
    LEFT JOIN payments p ON a.id = p.application_id
    WHERE s.deleted_at IS NULL
    GROUP BY s.id, s.name, s.department
    HAVING COUNT(a.id) > 0
    ORDER BY total_awarded DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get department-wise scholarship statistics
CREATE OR REPLACE FUNCTION get_department_scholarship_stats()
RETURNS TABLE (
    department VARCHAR(100),
    total_scholarships BIGINT,
    active_scholarships BIGINT,
    total_funding DECIMAL(12,2),
    allocated_funding DECIMAL(12,2),
    utilization_rate DECIMAL(5,2),
    total_applications BIGINT,
    approved_applications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(s.department, 'All Departments') as department,
        COUNT(s.id) as total_scholarships,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_scholarships,
        COALESCE(SUM(s.total_funding), 0) as total_funding,
        COALESCE(SUM(s.current_recipients * s.amount), 0) as allocated_funding,
        CASE 
            WHEN SUM(s.total_funding) > 0 THEN 
                ROUND((SUM(s.current_recipients * s.amount) / SUM(s.total_funding) * 100), 2)
            ELSE 0 
        END as utilization_rate,
        COUNT(a.id) as total_applications,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
    FROM scholarships s
    LEFT JOIN applications a ON s.id = a.scholarship_id
    WHERE s.deleted_at IS NULL
    GROUP BY s.department
    ORDER BY total_funding DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. AUTOMATED CLEANUP PROCEDURES
-- =====================================================

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete read notifications older than 6 months
    DELETE FROM notifications 
    WHERE is_read = true 
    AND created_at < CURRENT_DATE - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired notifications
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep audit logs for 2 years for compliance
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. PERFORMANCE MONITORING VIEWS
-- =====================================================

-- View for application processing performance
CREATE OR REPLACE VIEW v_application_processing_performance AS
SELECT 
    s.name as scholarship_name,
    s.academic_year,
    COUNT(a.id) as total_applications,
    AVG(EXTRACT(DAYS FROM (a.decision_date - a.submitted_at))) as avg_processing_days,
    MIN(EXTRACT(DAYS FROM (a.decision_date - a.submitted_at))) as min_processing_days,
    MAX(EXTRACT(DAYS FROM (a.decision_date - a.submitted_at))) as max_processing_days,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count,
    ROUND(AVG(a.total_score), 2) as avg_score
FROM scholarships s
JOIN applications a ON s.id = a.scholarship_id
WHERE a.decision_date IS NOT NULL
GROUP BY s.id, s.name, s.academic_year
ORDER BY avg_processing_days DESC;

-- View for payment processing performance
CREATE OR REPLACE VIEW v_payment_processing_performance AS
SELECT 
    DATE_TRUNC('month', p.created_at) as month,
    COUNT(p.id) as total_payments,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payments,
    SUM(p.amount) as total_amount,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as completed_amount,
    AVG(EXTRACT(DAYS FROM (p.completed_at - p.created_at))) as avg_processing_days,
    ROUND((COUNT(CASE WHEN p.status = 'completed' THEN 1 END)::DECIMAL / COUNT(p.id) * 100), 2) as completion_rate
FROM payments p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', p.created_at)
ORDER BY month DESC;
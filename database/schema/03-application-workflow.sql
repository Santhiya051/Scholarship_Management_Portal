-- =====================================================
-- Application Workflow & Business Logic
-- Triggers, Functions, and Constraints
-- =====================================================

-- =====================================================
-- 1. TRIGGER FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON scholarships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. APPLICATION STATUS MANAGEMENT
-- =====================================================

-- Function to validate application status transitions
CREATE OR REPLACE FUNCTION validate_application_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Define valid status transitions
    IF OLD.status IS NOT NULL AND NEW.status != OLD.status THEN
        -- Draft can go to: submitted, withdrawn
        IF OLD.status = 'draft' AND NEW.status NOT IN ('submitted', 'withdrawn') THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        
        -- Submitted can go to: under_review, withdrawn, pending_documents
        IF OLD.status = 'submitted' AND NEW.status NOT IN ('under_review', 'withdrawn', 'pending_documents') THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        
        -- Under_review can go to: approved, rejected, pending_documents, on_hold
        IF OLD.status = 'under_review' AND NEW.status NOT IN ('approved', 'rejected', 'pending_documents', 'on_hold') THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        
        -- Pending_documents can go to: under_review, withdrawn
        IF OLD.status = 'pending_documents' AND NEW.status NOT IN ('under_review', 'withdrawn') THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        
        -- Final states (approved, rejected, withdrawn) cannot be changed
        IF OLD.status IN ('approved', 'rejected', 'withdrawn') THEN
            RAISE EXCEPTION 'Cannot change status from final state %', OLD.status;
        END IF;
    END IF;
    
    -- Set submitted_at when status changes to submitted
    IF OLD.status != 'submitted' AND NEW.status = 'submitted' THEN
        NEW.submitted_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Set decision_date when status changes to approved or rejected
    IF OLD.status NOT IN ('approved', 'rejected') AND NEW.status IN ('approved', 'rejected') THEN
        NEW.decision_date = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_application_status 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION validate_application_status_transition();

-- =====================================================
-- 3. SCHOLARSHIP RECIPIENT MANAGEMENT
-- =====================================================

-- Function to update scholarship recipient count
CREATE OR REPLACE FUNCTION update_scholarship_recipients()
RETURNS TRIGGER AS $$
BEGIN
    -- When application is approved, increment recipient count
    IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE scholarships 
        SET current_recipients = current_recipients + 1 
        WHERE id = NEW.scholarship_id;
        
        -- Check if scholarship is now full
        UPDATE scholarships 
        SET status = 'closed' 
        WHERE id = NEW.scholarship_id 
        AND current_recipients >= max_recipients 
        AND status = 'active';
    END IF;
    
    -- When approved application is changed to non-approved, decrement count
    IF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE scholarships 
        SET current_recipients = current_recipients - 1 
        WHERE id = NEW.scholarship_id;
    END IF;
    
    -- When approved application is deleted, decrement count
    IF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE scholarships 
        SET current_recipients = current_recipients - 1 
        WHERE id = OLD.scholarship_id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scholarship_recipients_trigger
    AFTER UPDATE OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_scholarship_recipients();

-- =====================================================
-- 4. AUTOMATIC PAYMENT CREATION
-- =====================================================

-- Function to create payment record when application is approved
CREATE OR REPLACE FUNCTION create_payment_for_approved_application()
RETURNS TRIGGER AS $$
DECLARE
    scholarship_amount DECIMAL(10,2);
    ref_number VARCHAR(50);
BEGIN
    -- Only create payment when status changes to approved
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
        -- Get scholarship amount
        SELECT amount INTO scholarship_amount 
        FROM scholarships 
        WHERE id = NEW.scholarship_id;
        
        -- Generate reference number
        ref_number := 'PAY-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || 
                     UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
        
        -- Create payment record
        INSERT INTO payments (
            application_id,
            amount,
            reference_number,
            status,
            scheduled_date
        ) VALUES (
            NEW.id,
            scholarship_amount,
            ref_number,
            'pending',
            CURRENT_DATE + INTERVAL '7 days' -- Schedule payment for next week
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_payment_trigger
    AFTER UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_payment_for_approved_application();

-- =====================================================
-- 5. NOTIFICATION TRIGGERS
-- =====================================================

-- Function to create notifications for application events
CREATE OR REPLACE FUNCTION create_application_notifications()
RETURNS TRIGGER AS $$
DECLARE
    student_user_id UUID;
    scholarship_name VARCHAR(200);
    notification_title VARCHAR(200);
    notification_message TEXT;
    notification_type VARCHAR(50);
BEGIN
    -- Get student user ID and scholarship name
    SELECT u.id, s.name 
    INTO student_user_id, scholarship_name
    FROM students st
    JOIN users u ON st.user_id = u.id
    JOIN scholarships s ON s.id = NEW.scholarship_id
    WHERE st.id = NEW.student_id;
    
    -- Determine notification type and content based on status change
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        CASE NEW.status
            WHEN 'submitted' THEN
                notification_type := 'application_submitted';
                notification_title := 'Application Submitted Successfully';
                notification_message := 'Your application for "' || scholarship_name || '" has been submitted and is now under review.';
                
            WHEN 'approved' THEN
                notification_type := 'application_approved';
                notification_title := 'Congratulations! Application Approved';
                notification_message := 'Your application for "' || scholarship_name || '" has been approved. Payment processing will begin shortly.';
                
            WHEN 'rejected' THEN
                notification_type := 'application_rejected';
                notification_title := 'Application Decision';
                notification_message := 'Your application for "' || scholarship_name || '" has been reviewed. Unfortunately, it was not selected at this time.';
                
            WHEN 'pending_documents' THEN
                notification_type := 'document_required';
                notification_title := 'Additional Documents Required';
                notification_message := 'Your application for "' || scholarship_name || '" requires additional documentation. Please upload the required documents.';
                
            ELSE
                -- Don't create notification for other status changes
                RETURN NEW;
        END CASE;
        
        -- Insert notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority,
            action_url
        ) VALUES (
            student_user_id,
            notification_type,
            notification_title,
            notification_message,
            jsonb_build_object(
                'application_id', NEW.id,
                'scholarship_id', NEW.scholarship_id,
                'scholarship_name', scholarship_name
            ),
            CASE 
                WHEN NEW.status IN ('approved', 'rejected') THEN 'high'
                ELSE 'medium'
            END,
            '/applications/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_application_notifications_trigger
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_application_notifications();

-- =====================================================
-- 6. DOCUMENT VERIFICATION NOTIFICATIONS
-- =====================================================

-- Function to create notifications for document verification
CREATE OR REPLACE FUNCTION create_document_notifications()
RETURNS TRIGGER AS $$
DECLARE
    student_user_id UUID;
    scholarship_name VARCHAR(200);
BEGIN
    -- Only create notification when verification status changes
    IF TG_OP = 'UPDATE' AND OLD.verification_status != NEW.verification_status THEN
        -- Get student user ID and scholarship name
        SELECT u.id, s.name 
        INTO student_user_id, scholarship_name
        FROM applications a
        JOIN students st ON a.student_id = st.id
        JOIN users u ON st.user_id = u.id
        JOIN scholarships s ON a.scholarship_id = s.id
        WHERE a.id = NEW.application_id;
        
        -- Create notification based on verification status
        IF NEW.verification_status = 'verified' THEN
            INSERT INTO notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority,
                action_url
            ) VALUES (
                student_user_id,
                'document_verified',
                'Document Verified',
                'Your ' || NEW.document_type || ' document for "' || scholarship_name || '" has been verified.',
                jsonb_build_object(
                    'document_id', NEW.id,
                    'document_type', NEW.document_type,
                    'application_id', NEW.application_id
                ),
                'medium',
                '/applications/' || NEW.application_id
            );
            
        ELSIF NEW.verification_status = 'rejected' THEN
            INSERT INTO notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority,
                action_url
            ) VALUES (
                student_user_id,
                'document_required',
                'Document Rejected - Resubmission Required',
                'Your ' || NEW.document_type || ' document for "' || scholarship_name || '" was rejected. ' ||
                COALESCE('Reason: ' || NEW.verification_notes, 'Please resubmit with correct information.'),
                jsonb_build_object(
                    'document_id', NEW.id,
                    'document_type', NEW.document_type,
                    'application_id', NEW.application_id,
                    'rejection_reason', NEW.verification_notes
                ),
                'high',
                '/applications/' || NEW.application_id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_document_notifications_trigger
    AFTER UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION create_document_notifications();

-- =====================================================
-- 7. PAYMENT NOTIFICATIONS
-- =====================================================

-- Function to create notifications for payment events
CREATE OR REPLACE FUNCTION create_payment_notifications()
RETURNS TRIGGER AS $$
DECLARE
    student_user_id UUID;
    scholarship_name VARCHAR(200);
BEGIN
    -- Only create notification when payment status changes to completed
    IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Get student user ID and scholarship name
        SELECT u.id, s.name 
        INTO student_user_id, scholarship_name
        FROM applications a
        JOIN students st ON a.student_id = st.id
        JOIN users u ON st.user_id = u.id
        JOIN scholarships s ON a.scholarship_id = s.id
        WHERE a.id = NEW.application_id;
        
        -- Create payment notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority,
            action_url
        ) VALUES (
            student_user_id,
            'payment_processed',
            'Scholarship Payment Processed',
            'Your scholarship payment of $' || NEW.amount || ' for "' || scholarship_name || '" has been processed successfully. Reference: ' || NEW.reference_number,
            jsonb_build_object(
                'payment_id', NEW.id,
                'amount', NEW.amount,
                'reference_number', NEW.reference_number,
                'application_id', NEW.application_id
            ),
            'high',
            '/applications/' || NEW.application_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_payment_notifications_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION create_payment_notifications();

-- =====================================================
-- 8. AUDIT LOGGING TRIGGERS
-- =====================================================

-- Function to create audit logs for important table changes
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    action_type VARCHAR(10);
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Determine action type
    IF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        action_type := 'CREATE';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        action,
        resource_type,
        resource_id,
        old_values,
        new_values
    ) VALUES (
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_scholarships_trigger
    AFTER INSERT OR UPDATE OR DELETE ON scholarships
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_applications_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- 9. DATA VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate scholarship eligibility for application
CREATE OR REPLACE FUNCTION validate_scholarship_eligibility(
    p_student_id UUID,
    p_scholarship_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    student_record RECORD;
    scholarship_record RECORD;
BEGIN
    -- Get student information
    SELECT s.*, st.gpa, st.year_of_study, st.department, st.income_category, st.nationality
    INTO student_record
    FROM students s
    JOIN students st ON s.id = st.id
    WHERE s.id = p_student_id;
    
    -- Get scholarship information
    SELECT * INTO scholarship_record
    FROM scholarships
    WHERE id = p_scholarship_id AND status = 'active';
    
    -- Check if scholarship exists and is active
    IF scholarship_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check application deadline
    IF scholarship_record.application_deadline < CURRENT_DATE THEN
        RETURN FALSE;
    END IF;
    
    -- Check if scholarship has available slots
    IF scholarship_record.current_recipients >= scholarship_record.max_recipients THEN
        RETURN FALSE;
    END IF;
    
    -- Check department eligibility
    IF scholarship_record.department IS NOT NULL 
       AND scholarship_record.department != 'all' 
       AND scholarship_record.department != student_record.department THEN
        RETURN FALSE;
    END IF;
    
    -- Check GPA requirements
    IF scholarship_record.min_gpa IS NOT NULL 
       AND (student_record.gpa IS NULL OR student_record.gpa < scholarship_record.min_gpa) THEN
        RETURN FALSE;
    END IF;
    
    IF scholarship_record.max_gpa IS NOT NULL 
       AND (student_record.gpa IS NULL OR student_record.gpa > scholarship_record.max_gpa) THEN
        RETURN FALSE;
    END IF;
    
    -- Check year of study eligibility
    IF scholarship_record.year_of_study_eligible IS NOT NULL 
       AND jsonb_array_length(scholarship_record.year_of_study_eligible) > 0
       AND NOT (scholarship_record.year_of_study_eligible ? student_record.year_of_study::text) THEN
        RETURN FALSE;
    END IF;
    
    -- Check income category eligibility
    IF scholarship_record.income_category_eligible IS NOT NULL 
       AND jsonb_array_length(scholarship_record.income_category_eligible) > 0
       AND NOT (scholarship_record.income_category_eligible ? student_record.income_category) THEN
        RETURN FALSE;
    END IF;
    
    -- All checks passed
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. UTILITY FUNCTIONS
-- =====================================================

-- Function to get application statistics
CREATE OR REPLACE FUNCTION get_application_statistics(
    p_scholarship_id UUID DEFAULT NULL,
    p_academic_year VARCHAR(20) DEFAULT NULL
) RETURNS TABLE (
    total_applications BIGINT,
    submitted_applications BIGINT,
    approved_applications BIGINT,
    rejected_applications BIGINT,
    pending_applications BIGINT,
    average_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE a.status != 'draft') as submitted_applications,
        COUNT(*) FILTER (WHERE a.status = 'approved') as approved_applications,
        COUNT(*) FILTER (WHERE a.status = 'rejected') as rejected_applications,
        COUNT(*) FILTER (WHERE a.status IN ('submitted', 'under_review', 'pending_documents')) as pending_applications,
        AVG(a.total_score) as average_score
    FROM applications a
    JOIN scholarships s ON a.scholarship_id = s.id
    WHERE (p_scholarship_id IS NULL OR a.scholarship_id = p_scholarship_id)
    AND (p_academic_year IS NULL OR s.academic_year = p_academic_year);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate scholarship utilization
CREATE OR REPLACE FUNCTION get_scholarship_utilization()
RETURNS TABLE (
    scholarship_id UUID,
    scholarship_name VARCHAR(200),
    total_funding DECIMAL(12,2),
    allocated_funding DECIMAL(12,2),
    utilization_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.total_funding,
        (s.current_recipients * s.amount) as allocated_funding,
        ROUND(((s.current_recipients * s.amount) / s.total_funding * 100), 2) as utilization_percentage
    FROM scholarships s
    WHERE s.status IN ('active', 'closed')
    ORDER BY utilization_percentage DESC;
END;
$$ LANGUAGE plpgsql;
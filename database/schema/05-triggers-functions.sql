-- =====================================================
-- Advanced Database Functions & Stored Procedures
-- Business Logic Implementation
-- =====================================================

-- =====================================================
-- 1. COMPREHENSIVE ELIGIBILITY CHECKING
-- =====================================================

-- Enhanced function to check detailed scholarship eligibility
CREATE OR REPLACE FUNCTION check_detailed_eligibility(
    p_student_id UUID,
    p_scholarship_id UUID
) RETURNS TABLE (
    is_eligible BOOLEAN,
    eligibility_score INTEGER,
    failed_criteria JSONB,
    recommendations TEXT
) AS $$
DECLARE
    student_rec RECORD;
    scholarship_rec RECORD;
    score INTEGER := 100;
    failed_checks JSONB := '[]'::jsonb;
    recommendation_text TEXT := '';
BEGIN
    -- Get comprehensive student information
    SELECT 
        s.*,
        u.email,
        u.first_name,
        u.last_name
    INTO student_rec
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = p_student_id;
    
    -- Get scholarship information
    SELECT * INTO scholarship_rec
    FROM scholarships
    WHERE id = p_scholarship_id;
    
    -- Basic checks
    IF scholarship_rec IS NULL THEN
        RETURN QUERY SELECT false, 0, '["Scholarship not found"]'::jsonb, 'Scholarship does not exist.';
        RETURN;
    END IF;
    
    IF scholarship_rec.status != 'active' THEN
        failed_checks := failed_checks || '["Scholarship not active"]'::jsonb;
        score := score - 100;
    END IF;
    
    -- Check application deadline
    IF scholarship_rec.application_deadline < CURRENT_DATE THEN
        failed_checks := failed_checks || '["Application deadline passed"]'::jsonb;
        score := score - 100;
        recommendation_text := recommendation_text || 'Application deadline has passed. ';
    END IF;
    
    -- Check available slots
    IF scholarship_rec.current_recipients >= scholarship_rec.max_recipients THEN
        failed_checks := failed_checks || '["No available slots"]'::jsonb;
        score := score - 100;
        recommendation_text := recommendation_text || 'All scholarship slots are filled. ';
    END IF;
    
    -- Check if already applied
    IF EXISTS (
        SELECT 1 FROM applications 
        WHERE student_id = p_student_id 
        AND scholarship_id = p_scholarship_id
    ) THEN
        failed_checks := failed_checks || '["Already applied"]'::jsonb;
        score := score - 100;
        recommendation_text := recommendation_text || 'You have already applied for this scholarship. ';
    END IF;
    
    -- Department eligibility
    IF scholarship_rec.department IS NOT NULL 
       AND scholarship_rec.department != 'all' 
       AND scholarship_rec.department != student_rec.department THEN
        failed_checks := failed_checks || jsonb_build_array('Department mismatch: Required ' || scholarship_rec.department || ', student is in ' || student_rec.department);
        score := score - 30;
        recommendation_text := recommendation_text || 'This scholarship is for ' || scholarship_rec.department || ' students only. ';
    END IF;
    
    -- GPA requirements
    IF scholarship_rec.min_gpa IS NOT NULL THEN
        IF student_rec.gpa IS NULL THEN
            failed_checks := failed_checks || '["GPA not provided"]'::jsonb;
            score := score - 20;
            recommendation_text := recommendation_text || 'Please update your GPA in your profile. ';
        ELSIF student_rec.gpa < scholarship_rec.min_gpa THEN
            failed_checks := failed_checks || jsonb_build_array('GPA too low: Required ' || scholarship_rec.min_gpa || ', current ' || student_rec.gpa);
            score := score - 40;
            recommendation_text := recommendation_text || 'Minimum GPA requirement not met. ';
        END IF;
    END IF;
    
    IF scholarship_rec.max_gpa IS NOT NULL AND student_rec.gpa IS NOT NULL THEN
        IF student_rec.gpa > scholarship_rec.max_gpa THEN
            failed_checks := failed_checks || jsonb_build_array('GPA too high: Maximum ' || scholarship_rec.max_gpa || ', current ' || student_rec.gpa);
            score := score - 20;
        END IF;
    END IF;
    
    -- Year of study eligibility
    IF scholarship_rec.year_of_study_eligible IS NOT NULL 
       AND jsonb_array_length(scholarship_rec.year_of_study_eligible) > 0 THEN
        IF NOT (scholarship_rec.year_of_study_eligible ? student_rec.year_of_study::text) THEN
            failed_checks := failed_checks || jsonb_build_array('Year of study not eligible: ' || student_rec.year_of_study);
            score := score - 25;
            recommendation_text := recommendation_text || 'This scholarship is not available for your current year of study. ';
        END IF;
    END IF;
    
    -- Income category eligibility
    IF scholarship_rec.income_category_eligible IS NOT NULL 
       AND jsonb_array_length(scholarship_rec.income_category_eligible) > 0 THEN
        IF student_rec.income_category IS NULL THEN
            failed_checks := failed_checks || '["Income category not provided"]'::jsonb;
            score := score - 15;
            recommendation_text := recommendation_text || 'Please update your income category in your profile. ';
        ELSIF NOT (scholarship_rec.income_category_eligible ? student_rec.income_category) THEN
            failed_checks := failed_checks || jsonb_build_array('Income category not eligible: ' || student_rec.income_category);
            score := score - 30;
        END IF;
    END IF;
    
    -- Gender requirements
    IF scholarship_rec.gender_requirements IS NOT NULL 
       AND scholarship_rec.gender_requirements != 'any' THEN
        IF student_rec.gender IS NULL THEN
            failed_checks := failed_checks || '["Gender not provided"]'::jsonb;
            score := score - 10;
        ELSIF student_rec.gender != scholarship_rec.gender_requirements THEN
            failed_checks := failed_checks || jsonb_build_array('Gender requirement not met: ' || scholarship_rec.gender_requirements);
            score := score - 50;
        END IF;
    END IF;
    
    -- Nationality requirements
    IF scholarship_rec.nationality_requirements IS NOT NULL 
       AND jsonb_array_length(scholarship_rec.nationality_requirements) > 0 THEN
        IF student_rec.nationality IS NULL THEN
            failed_checks := failed_checks || '["Nationality not provided"]'::jsonb;
            score := score - 10;
        ELSIF NOT (scholarship_rec.nationality_requirements ? student_rec.nationality) THEN
            failed_checks := failed_checks || jsonb_build_array('Nationality not eligible: ' || student_rec.nationality);
            score := score - 40;
        END IF;
    END IF;
    
    -- Ensure score doesn't go below 0
    score := GREATEST(score, 0);
    
    -- Generate recommendations for improvement
    IF recommendation_text = '' AND score < 100 THEN
        recommendation_text := 'Please review the eligibility criteria and update your profile if needed.';
    END IF;
    
    RETURN QUERY SELECT 
        (score >= 70), -- Consider eligible if score is 70% or higher
        score,
        failed_checks,
        TRIM(recommendation_text);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. APPLICATION SCORING SYSTEM
-- =====================================================

-- Function to calculate application score based on multiple criteria
CREATE OR REPLACE FUNCTION calculate_application_score(
    p_application_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    app_rec RECORD;
    student_rec RECORD;
    scholarship_rec RECORD;
    total_score DECIMAL(5,2) := 0;
    gpa_score DECIMAL(5,2) := 0;
    financial_need_score DECIMAL(5,2) := 0;
    essay_score DECIMAL(5,2) := 0;
    document_score DECIMAL(5,2) := 0;
    approval_scores DECIMAL(5,2) := 0;
BEGIN
    -- Get application, student, and scholarship information
    SELECT a.*, s.gpa, s.financial_need_score, s.year_of_study
    INTO app_rec, student_rec
    FROM applications a
    JOIN students s ON a.student_id = s.id
    WHERE a.id = p_application_id;
    
    SELECT * INTO scholarship_rec
    FROM scholarships
    WHERE id = app_rec.scholarship_id;
    
    -- GPA Score (30% weight)
    IF student_rec.gpa IS NOT NULL THEN
        gpa_score := LEAST((student_rec.gpa / 4.0) * 30, 30);
    END IF;
    
    -- Financial Need Score (20% weight)
    IF student_rec.financial_need_score IS NOT NULL THEN
        financial_need_score := (student_rec.financial_need_score / 100.0) * 20;
    END IF;
    
    -- Essay Quality Score (25% weight) - Based on word count and completeness
    IF app_rec.essays IS NOT NULL THEN
        -- Simple scoring based on essay completeness
        essay_score := CASE 
            WHEN jsonb_array_length(jsonb_object_keys(app_rec.essays)) >= 2 THEN 25
            WHEN jsonb_array_length(jsonb_object_keys(app_rec.essays)) = 1 THEN 15
            ELSE 0
        END;
    END IF;
    
    -- Document Completeness Score (15% weight)
    SELECT 
        CASE 
            WHEN COUNT(*) >= 4 THEN 15 -- All required documents
            WHEN COUNT(*) >= 3 THEN 12 -- Most documents
            WHEN COUNT(*) >= 2 THEN 8  -- Some documents
            ELSE 3 -- Few documents
        END
    INTO document_score
    FROM documents
    WHERE application_id = p_application_id 
    AND verification_status = 'verified';
    
    -- Reviewer Scores (10% weight) - Average of all approval scores
    SELECT COALESCE(AVG(score), 0) * 0.1
    INTO approval_scores
    FROM approvals
    WHERE application_id = p_application_id
    AND score IS NOT NULL;
    
    -- Calculate total score
    total_score := gpa_score + financial_need_score + essay_score + document_score + approval_scores;
    
    -- Update application with calculated score
    UPDATE applications 
    SET total_score = total_score
    WHERE id = p_application_id;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. RANKING SYSTEM
-- =====================================================

-- Function to rank applications for a scholarship
CREATE OR REPLACE FUNCTION rank_scholarship_applications(
    p_scholarship_id UUID
) RETURNS INTEGER AS $$
DECLARE
    app_record RECORD;
    current_rank INTEGER := 1;
BEGIN
    -- First, calculate scores for all applications
    FOR app_record IN 
        SELECT id FROM applications 
        WHERE scholarship_id = p_scholarship_id 
        AND status IN ('submitted', 'under_review', 'approved')
    LOOP
        PERFORM calculate_application_score(app_record.id);
    END LOOP;
    
    -- Then rank applications by score
    FOR app_record IN 
        SELECT id FROM applications 
        WHERE scholarship_id = p_scholarship_id 
        AND status IN ('submitted', 'under_review', 'approved')
        ORDER BY total_score DESC, submitted_at ASC
    LOOP
        UPDATE applications 
        SET ranking = current_rank 
        WHERE id = app_record.id;
        
        current_rank := current_rank + 1;
    END LOOP;
    
    RETURN current_rank - 1; -- Return total number of ranked applications
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. DOCUMENT MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to check if all required documents are uploaded and verified
CREATE OR REPLACE FUNCTION check_application_document_completeness(
    p_application_id UUID
) RETURNS TABLE (
    is_complete BOOLEAN,
    missing_documents TEXT[],
    pending_verification TEXT[],
    rejected_documents TEXT[]
) AS $$
DECLARE
    required_docs TEXT[] := ARRAY['transcript', 'recommendation_letter', 'personal_statement', 'enrollment_proof'];
    uploaded_docs TEXT[];
    verified_docs TEXT[];
    rejected_docs TEXT[];
    missing_docs TEXT[];
    pending_docs TEXT[];
BEGIN
    -- Get uploaded document types
    SELECT ARRAY_AGG(document_type)
    INTO uploaded_docs
    FROM documents
    WHERE application_id = p_application_id
    AND deleted_at IS NULL;
    
    -- Get verified document types
    SELECT ARRAY_AGG(document_type)
    INTO verified_docs
    FROM documents
    WHERE application_id = p_application_id
    AND verification_status = 'verified'
    AND deleted_at IS NULL;
    
    -- Get rejected document types
    SELECT ARRAY_AGG(document_type)
    INTO rejected_docs
    FROM documents
    WHERE application_id = p_application_id
    AND verification_status = 'rejected'
    AND deleted_at IS NULL;
    
    -- Find missing documents
    SELECT ARRAY_AGG(doc_type)
    INTO missing_docs
    FROM unnest(required_docs) AS doc_type
    WHERE doc_type != ALL(COALESCE(uploaded_docs, ARRAY[]::TEXT[]));
    
    -- Find pending verification documents
    SELECT ARRAY_AGG(document_type)
    INTO pending_docs
    FROM documents
    WHERE application_id = p_application_id
    AND verification_status = 'pending'
    AND deleted_at IS NULL;
    
    RETURN QUERY SELECT 
        (COALESCE(array_length(missing_docs, 1), 0) = 0 AND 
         COALESCE(array_length(pending_docs, 1), 0) = 0 AND 
         COALESCE(array_length(rejected_docs, 1), 0) = 0),
        COALESCE(missing_docs, ARRAY[]::TEXT[]),
        COALESCE(pending_docs, ARRAY[]::TEXT[]),
        COALESCE(rejected_docs, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. WORKFLOW AUTOMATION FUNCTIONS
-- =====================================================

-- Function to auto-advance applications through workflow
CREATE OR REPLACE FUNCTION process_application_workflow()
RETURNS INTEGER AS $$
DECLARE
    app_record RECORD;
    processed_count INTEGER := 0;
    doc_status RECORD;
BEGIN
    -- Process applications that are ready to move forward
    FOR app_record IN 
        SELECT id, status, current_approval_step, scholarship_id, student_id
        FROM applications 
        WHERE status IN ('submitted', 'pending_documents')
    LOOP
        -- Check document completeness
        SELECT * INTO doc_status
        FROM check_application_document_completeness(app_record.id);
        
        -- If documents are complete and status is pending_documents, move to under_review
        IF app_record.status = 'pending_documents' AND doc_status.is_complete THEN
            UPDATE applications 
            SET status = 'under_review',
                current_approval_step = 'coordinator'
            WHERE id = app_record.id;
            
            processed_count := processed_count + 1;
            
        -- If documents are incomplete and status is submitted, move to pending_documents
        ELSIF app_record.status = 'submitted' AND NOT doc_status.is_complete THEN
            UPDATE applications 
            SET status = 'pending_documents'
            WHERE id = app_record.id;
            
            processed_count := processed_count + 1;
        END IF;
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. SCHOLARSHIP LIFECYCLE MANAGEMENT
-- =====================================================

-- Function to automatically close expired scholarships
CREATE OR REPLACE FUNCTION close_expired_scholarships()
RETURNS INTEGER AS $$
DECLARE
    closed_count INTEGER := 0;
BEGIN
    -- Close scholarships where application deadline has passed
    UPDATE scholarships 
    SET status = 'closed'
    WHERE status = 'active'
    AND application_deadline < CURRENT_DATE;
    
    GET DIAGNOSTICS closed_count = ROW_COUNT;
    
    -- Also close scholarships that are full
    UPDATE scholarships 
    SET status = 'closed'
    WHERE status = 'active'
    AND current_recipients >= max_recipients;
    
    GET DIAGNOSTICS closed_count = closed_count + ROW_COUNT;
    
    RETURN closed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. PERFORMANCE ANALYTICS FUNCTIONS
-- =====================================================

-- Function to generate comprehensive scholarship analytics
CREATE OR REPLACE FUNCTION generate_scholarship_analytics(
    p_scholarship_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,2),
    metric_description TEXT
) AS $$
DECLARE
    date_filter TEXT := '';
    scholarship_filter TEXT := '';
BEGIN
    -- Build dynamic filters
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        date_filter := ' AND a.submitted_at BETWEEN ''' || p_start_date || ''' AND ''' || p_end_date || '''';
    END IF;
    
    IF p_scholarship_id IS NOT NULL THEN
        scholarship_filter := ' AND s.id = ''' || p_scholarship_id || '''';
    END IF;
    
    -- Return various metrics
    RETURN QUERY
    WITH metrics AS (
        SELECT 
            'total_applications' as name,
            COUNT(a.id)::DECIMAL as value,
            'Total number of applications received' as description
        FROM scholarships s
        LEFT JOIN applications a ON s.id = a.scholarship_id
        WHERE s.deleted_at IS NULL
        
        UNION ALL
        
        SELECT 
            'approval_rate' as name,
            CASE 
                WHEN COUNT(a.id) > 0 THEN 
                    ROUND((COUNT(CASE WHEN a.status = 'approved' THEN 1 END)::DECIMAL / COUNT(a.id) * 100), 2)
                ELSE 0 
            END as value,
            'Percentage of applications approved' as description
        FROM scholarships s
        LEFT JOIN applications a ON s.id = a.scholarship_id
        WHERE s.deleted_at IS NULL
        
        UNION ALL
        
        SELECT 
            'avg_processing_time' as name,
            COALESCE(AVG(EXTRACT(DAYS FROM (a.decision_date - a.submitted_at))), 0) as value,
            'Average processing time in days' as description
        FROM scholarships s
        LEFT JOIN applications a ON s.id = a.scholarship_id
        WHERE s.deleted_at IS NULL
        AND a.decision_date IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'total_funding_allocated' as name,
            COALESCE(SUM(s.current_recipients * s.amount), 0) as value,
            'Total funding allocated to recipients' as description
        FROM scholarships s
        WHERE s.deleted_at IS NULL
        
        UNION ALL
        
        SELECT 
            'avg_application_score' as name,
            COALESCE(AVG(a.total_score), 0) as value,
            'Average application score' as description
        FROM scholarships s
        LEFT JOIN applications a ON s.id = a.scholarship_id
        WHERE s.deleted_at IS NULL
        AND a.total_score IS NOT NULL
    )
    SELECT name, value, description FROM metrics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. DATA INTEGRITY MAINTENANCE
-- =====================================================

-- Function to fix data inconsistencies
CREATE OR REPLACE FUNCTION fix_data_inconsistencies()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    fixed_count INTEGER;
BEGIN
    -- Fix scholarship recipient counts
    UPDATE scholarships 
    SET current_recipients = (
        SELECT COUNT(*)
        FROM applications a
        WHERE a.scholarship_id = scholarships.id
        AND a.status = 'approved'
    )
    WHERE id IN (
        SELECT s.id
        FROM scholarships s
        LEFT JOIN applications a ON s.id = a.scholarship_id AND a.status = 'approved'
        GROUP BY s.id, s.current_recipients
        HAVING s.current_recipients != COUNT(a.id)
    );
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    result_text := result_text || 'Fixed ' || fixed_count || ' scholarship recipient counts. ';
    
    -- Recalculate application scores for applications without scores
    SELECT COUNT(*)
    INTO fixed_count
    FROM applications
    WHERE total_score IS NULL
    AND status IN ('submitted', 'under_review', 'approved', 'rejected');
    
    IF fixed_count > 0 THEN
        PERFORM calculate_application_score(id)
        FROM applications
        WHERE total_score IS NULL
        AND status IN ('submitted', 'under_review', 'approved', 'rejected');
        
        result_text := result_text || 'Calculated scores for ' || fixed_count || ' applications. ';
    END IF;
    
    -- Update application rankings
    PERFORM rank_scholarship_applications(id)
    FROM scholarships
    WHERE status IN ('active', 'closed');
    
    result_text := result_text || 'Updated application rankings for all scholarships.';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. SCHEDULED MAINTENANCE PROCEDURES
-- =====================================================

-- Function to run daily maintenance tasks
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    task_result INTEGER;
BEGIN
    -- Close expired scholarships
    SELECT close_expired_scholarships() INTO task_result;
    result_text := result_text || 'Closed ' || task_result || ' expired scholarships. ';
    
    -- Process application workflow
    SELECT process_application_workflow() INTO task_result;
    result_text := result_text || 'Processed ' || task_result || ' applications through workflow. ';
    
    -- Schedule deadline reminders
    SELECT schedule_deadline_reminders() INTO task_result;
    result_text := result_text || 'Scheduled ' || task_result || ' deadline reminders. ';
    
    -- Cleanup old notifications
    SELECT cleanup_old_notifications() INTO task_result;
    result_text := result_text || 'Cleaned up ' || task_result || ' old notifications. ';
    
    -- Fix data inconsistencies
    result_text := result_text || fix_data_inconsistencies();
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;
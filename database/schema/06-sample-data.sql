-- =====================================================
-- Sample Data for College Scholarship Management Portal
-- Test Data for Development and Demonstration
-- =====================================================

-- =====================================================
-- 1. ROLES DATA (Already inserted in migration)
-- =====================================================
-- Roles are created in the migration file

-- =====================================================
-- 2. SAMPLE USERS DATA
-- =====================================================

-- Insert sample admin user
INSERT INTO users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, email_verified) 
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM roles WHERE name = 'admin'),
    'admin@university.edu',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', -- password: admin123
    'System',
    'Administrator',
    '+1-555-0001',
    true,
    true
);

-- Insert sample coordinator
INSERT INTO users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, email_verified) 
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM roles WHERE name = 'coordinator'),
    'coordinator@university.edu',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', -- password: coord123
    'Dr. Sarah',
    'Johnson',
    '+1-555-0002',
    true,
    true
);

-- Insert sample committee member
INSERT INTO users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, email_verified) 
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM roles WHERE name = 'committee'),
    'committee@university.edu',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', -- password: committee123
    'Prof. Michael',
    'Davis',
    '+1-555-0003',
    true,
    true
);

-- Insert sample finance officer
INSERT INTO users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, email_verified) 
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM roles WHERE name = 'finance'),
    'finance@university.edu',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', -- password: finance123
    'Lisa',
    'Chen',
    '+1-555-0004',
    true,
    true
);

-- Insert sample students
INSERT INTO users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, email_verified) 
VALUES 
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'john.doe@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'John', 'Doe', '+1-555-1001', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'jane.smith@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Jane', 'Smith', '+1-555-1002', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'mike.wilson@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Michael', 'Wilson', '+1-555-1003', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'emily.brown@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Emily', 'Brown', '+1-555-1004', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'david.garcia@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'David', 'Garcia', '+1-555-1005', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'sarah.lee@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Sarah', 'Lee', '+1-555-1006', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'alex.martinez@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Alex', 'Martinez', '+1-555-1007', true, true),
    (uuid_generate_v4(), (SELECT id FROM roles WHERE name = 'student'), 'jessica.taylor@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Jessica', 'Taylor', '+1-555-1008', true, true);

-- =====================================================
-- 3. SAMPLE STUDENTS DATA
-- =====================================================

INSERT INTO students (
    id, user_id, student_id, department, major, year_of_study, gpa, 
    enrollment_date, expected_graduation, date_of_birth, gender, nationality,
    address, family_income, income_category, financial_need_score,
    bank_account_number, bank_name, account_holder_name
) VALUES 
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'john.doe@student.edu'),
    'CS2021001',
    'computer-science',
    'Computer Science',
    3,
    3.85,
    '2021-09-01',
    '2025-05-15',
    '2002-03-15',
    'male',
    'USA',
    '{"street": "123 Main St", "city": "University City", "state": "CA", "zip": "90210"}'::jsonb,
    45000.00,
    'middle',
    65,
    '1234567890',
    'University Credit Union',
    'John Doe'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'jane.smith@student.edu'),
    'ENG2020002',
    'engineering',
    'Electrical Engineering',
    4,
    3.92,
    '2020-09-01',
    '2024-05-15',
    '2001-07-22',
    'female',
    'USA',
    '{"street": "456 Oak Ave", "city": "University City", "state": "CA", "zip": "90211"}'::jsonb,
    32000.00,
    'low',
    85,
    '2345678901',
    'First National Bank',
    'Jane Smith'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'mike.wilson@student.edu'),
    'BUS2022003',
    'business',
    'Business Administration',
    2,
    3.67,
    '2022-09-01',
    '2026-05-15',
    '2003-11-08',
    'male',
    'Canada',
    '{"street": "789 Pine St", "city": "University City", "state": "CA", "zip": "90212"}'::jsonb,
    78000.00,
    'high',
    35,
    '3456789012',
    'Community Bank',
    'Michael Wilson'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'emily.brown@student.edu'),
    'MED2021004',
    'medicine',
    'Pre-Medicine',
    3,
    3.98,
    '2021-09-01',
    '2025-05-15',
    '2002-01-30',
    'female',
    'USA',
    '{"street": "321 Elm St", "city": "University City", "state": "CA", "zip": "90213"}'::jsonb,
    28000.00,
    'low',
    90,
    '4567890123',
    'University Credit Union',
    'Emily Brown'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'david.garcia@student.edu'),
    'ART2020005',
    'arts',
    'Fine Arts',
    4,
    3.45,
    '2020-09-01',
    '2024-05-15',
    '2001-09-12',
    'male',
    'Mexico',
    '{"street": "654 Maple Ave", "city": "University City", "state": "CA", "zip": "90214"}'::jsonb,
    25000.00,
    'low',
    95,
    '5678901234',
    'Regional Bank',
    'David Garcia'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'sarah.lee@student.edu'),
    'SCI2022006',
    'sciences',
    'Biology',
    2,
    3.78,
    '2022-09-01',
    '2026-05-15',
    '2003-05-18',
    'female',
    'South Korea',
    '{"street": "987 Cedar St", "city": "University City", "state": "CA", "zip": "90215"}'::jsonb,
    55000.00,
    'middle',
    55,
    '6789012345',
    'International Bank',
    'Sarah Lee'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'alex.martinez@student.edu'),
    'CS2023007',
    'computer-science',
    'Computer Science',
    1,
    3.56,
    '2023-09-01',
    '2027-05-15',
    '2004-12-03',
    'non-binary',
    'USA',
    '{"street": "147 Birch Ave", "city": "University City", "state": "CA", "zip": "90216"}'::jsonb,
    38000.00,
    'middle',
    70,
    '7890123456',
    'Student Bank',
    'Alex Martinez'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'jessica.taylor@student.edu'),
    'ENG2021008',
    'engineering',
    'Mechanical Engineering',
    3,
    3.89,
    '2021-09-01',
    '2025-05-15',
    '2002-08-25',
    'female',
    'USA',
    '{"street": "258 Willow St", "city": "University City", "state": "CA", "zip": "90217"}'::jsonb,
    42000.00,
    'middle',
    60,
    '8901234567',
    'University Credit Union',
    'Jessica Taylor'
);

-- =====================================================
-- 4. SAMPLE SCHOLARSHIPS DATA
-- =====================================================

INSERT INTO scholarships (
    id, name, description, amount, total_funding, max_recipients,
    application_start_date, application_deadline, academic_year,
    department, min_gpa, year_of_study_eligible, income_category_eligible,
    requirements, status, created_by
) VALUES 
(
    uuid_generate_v4(),
    'Merit Excellence Scholarship',
    'Awarded to students with outstanding academic performance across all disciplines. This scholarship recognizes students who have demonstrated exceptional academic achievement and leadership potential.',
    5000.00,
    50000.00,
    10,
    '2024-01-01',
    '2024-03-15',
    '2024-2025',
    'all',
    3.5,
    '[2, 3, 4]'::jsonb,
    '["low", "middle"]'::jsonb,
    '["Official transcript", "Two letters of recommendation", "Personal statement", "Leadership experience essay"]'::jsonb,
    'active',
    (SELECT id FROM users WHERE email = 'admin@university.edu')
),
(
    uuid_generate_v4(),
    'STEM Innovation Grant',
    'Supporting students in Science, Technology, Engineering, and Mathematics fields who demonstrate innovation and research potential.',
    7500.00,
    75000.00,
    10,
    '2024-01-15',
    '2024-04-01',
    '2024-2025',
    'computer-science',
    3.2,
    '[2, 3, 4]'::jsonb,
    '["low", "middle", "high"]'::jsonb,
    '["Research proposal", "Faculty endorsement", "Academic transcript", "Project portfolio"]'::jsonb,
    'active',
    (SELECT id FROM users WHERE email = 'coordinator@university.edu')
),
(
    uuid_generate_v4(),
    'Engineering Excellence Award',
    'Recognizing outstanding engineering students who show promise in their field and commitment to innovation.',
    6000.00,
    60000.00,
    10,
    '2024-02-01',
    '2024-04-15',
    '2024-2025',
    'engineering',
    3.3,
    '[3, 4]'::jsonb,
    '["low", "middle"]'::jsonb,
    '["Technical project report", "Industry recommendation", "Academic transcript"]'::jsonb,
    'active',
    (SELECT id FROM users WHERE email = 'coordinator@university.edu')
),
(
    uuid_generate_v4(),
    'Community Service Leadership Award',
    'Honoring students who have made significant contributions to their communities through volunteer service and leadership.',
    3000.00,
    30000.00,
    10,
    '2024-01-01',
    '2024-03-30',
    '2024-2025',
    'all',
    3.0,
    '[1, 2, 3, 4]'::jsonb,
    '["low", "middle", "high"]'::jsonb,
    '["Community service verification", "Leadership portfolio", "Personal statement", "Reference letters"]'::jsonb,
    'active',
    (SELECT id FROM users WHERE email = 'admin@university.edu')
),
(
    uuid_generate_v4(),
    'First-Generation College Student Grant',
    'Supporting first-generation college students in their pursuit of higher education.',
    4000.00,
    40000.00,
    10,
    '2024-02-15',
    '2024-05-01',
    '2024-2025',
    'all',
    2.8,
    '[1, 2, 3, 4]'::jsonb,
    '["low", "middle"]'::jsonb,
    '["Family education history", "Financial need documentation", "Personal essay", "Academic transcript"]'::jsonb,
    'active',
    (SELECT id FROM users WHERE email = 'admin@university.edu')
),
(
    uuid_generate_v4(),
    'International Student Excellence Scholarship',
    'Supporting outstanding international students in their academic journey.',
    8000.00,
    40000.00,
    5,
    '2024-01-01',
    '2024-02-28',
    '2024-2025',
    'all',
    3.6,
    '[2, 3, 4]'::jsonb,
    '["low", "middle", "high"]'::jsonb,
    '["Passport copy", "Academic transcript", "English proficiency certificate", "Cultural contribution essay"]'::jsonb,
    'closed',
    (SELECT id FROM users WHERE email = 'admin@university.edu')
);

-- =====================================================
-- 5. SAMPLE APPLICATIONS DATA
-- =====================================================

-- Application 1: John Doe - Merit Excellence Scholarship (Approved)
INSERT INTO applications (
    id, student_id, scholarship_id, status, 
    personal_info, academic_info, essays, financial_info,
    submitted_at, decision_date, total_score, ranking
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM students WHERE student_id = 'CS2021001'),
    (SELECT id FROM scholarships WHERE name = 'Merit Excellence Scholarship'),
    'approved',
    '{"first_name": "John", "last_name": "Doe", "email": "john.doe@student.edu", "phone": "+1-555-1001", "address": {"street": "123 Main St", "city": "University City", "state": "CA", "zip": "90210"}}'::jsonb,
    '{"student_id": "CS2021001", "gpa": 3.85, "major": "Computer Science", "year_of_study": 3, "expected_graduation": "2025-05-15"}'::jsonb,
    '{"leadership_essay": "Throughout my academic journey, I have consistently sought opportunities to lead and inspire others...", "personal_statement": "My passion for computer science began in high school when I first learned programming..."}'::jsonb,
    '{"family_income": 45000, "financial_need_explanation": "As a middle-income family, this scholarship would significantly help reduce my educational expenses..."}'::jsonb,
    '2024-02-15 10:30:00',
    '2024-03-01 14:20:00',
    87.5,
    1
);

-- Application 2: Jane Smith - STEM Innovation Grant (Under Review)
INSERT INTO applications (
    id, student_id, scholarship_id, status, current_approval_step,
    personal_info, academic_info, essays, financial_info,
    submitted_at, total_score, ranking
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM students WHERE student_id = 'ENG2020002'),
    (SELECT id FROM scholarships WHERE name = 'STEM Innovation Grant'),
    'under_review',
    'committee',
    '{"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@student.edu", "phone": "+1-555-1002"}'::jsonb,
    '{"student_id": "ENG2020002", "gpa": 3.92, "major": "Electrical Engineering", "year_of_study": 4}'::jsonb,
    '{"research_proposal": "My research focuses on developing more efficient solar panel technology...", "innovation_statement": "Innovation in renewable energy is crucial for our future..."}'::jsonb,
    '{"family_income": 32000, "financial_need_score": 85}'::jsonb,
    '2024-02-20 09:15:00',
    92.3,
    1
);

-- Application 3: Emily Brown - Merit Excellence Scholarship (Approved)
INSERT INTO applications (
    id, student_id, scholarship_id, status,
    personal_info, academic_info, essays, financial_info,
    submitted_at, decision_date, total_score, ranking
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM students WHERE student_id = 'MED2021004'),
    (SELECT id FROM scholarships WHERE name = 'Merit Excellence Scholarship'),
    'approved',
    '{"first_name": "Emily", "last_name": "Brown", "email": "emily.brown@student.edu", "phone": "+1-555-1004"}'::jsonb,
    '{"student_id": "MED2021004", "gpa": 3.98, "major": "Pre-Medicine", "year_of_study": 3}'::jsonb,
    '{"leadership_essay": "As president of the Pre-Med Society, I have organized numerous community health initiatives...", "personal_statement": "My commitment to healthcare stems from my desire to serve underserved communities..."}'::jsonb,
    '{"family_income": 28000, "financial_need_score": 90}'::jsonb,
    '2024-02-10 16:45:00',
    '2024-02-28 11:30:00',
    95.2,
    2
);

-- Application 4: David Garcia - Community Service Leadership Award (Pending Documents)
INSERT INTO applications (
    id, student_id, scholarship_id, status,
    personal_info, academic_info, essays, financial_info,
    submitted_at, total_score
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM students WHERE student_id = 'ART2020005'),
    (SELECT id FROM scholarships WHERE name = 'Community Service Leadership Award'),
    'pending_documents',
    '{"first_name": "David", "last_name": "Garcia", "email": "david.garcia@student.edu", "phone": "+1-555-1005"}'::jsonb,
    '{"student_id": "ART2020005", "gpa": 3.45, "major": "Fine Arts", "year_of_study": 4}'::jsonb,
    '{"service_essay": "Through my work with local art therapy programs, I have helped bring healing to trauma survivors...", "leadership_statement": "Leadership in the arts means creating inclusive spaces for creative expression..."}'::jsonb,
    '{"family_income": 25000, "financial_need_score": 95}'::jsonb,
    '2024-02-25 13:20:00',
    78.9
);

-- =====================================================
-- 6. SAMPLE DOCUMENTS DATA
-- =====================================================

-- Documents for John Doe's application
INSERT INTO documents (
    id, application_id, document_type, original_filename, stored_filename, 
    file_path, file_size, mime_type, uploaded_by, verification_status, verified_by, verified_at
) VALUES 
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    'transcript',
    'john_doe_transcript.pdf',
    'doc_' || extract(epoch from now()) || '_transcript.pdf',
    '/uploads/documents/transcripts/',
    245760,
    'application/pdf',
    (SELECT id FROM users WHERE email = 'john.doe@student.edu'),
    'verified',
    (SELECT id FROM users WHERE email = 'coordinator@university.edu'),
    '2024-02-16 14:30:00'
),
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    'recommendation_letter',
    'recommendation_prof_johnson.pdf',
    'doc_' || extract(epoch from now()) || '_recommendation.pdf',
    '/uploads/documents/recommendations/',
    189432,
    'application/pdf',
    (SELECT id FROM users WHERE email = 'john.doe@student.edu'),
    'verified',
    (SELECT id FROM users WHERE email = 'coordinator@university.edu'),
    '2024-02-16 14:35:00'
);

-- Documents for Jane Smith's application
INSERT INTO documents (
    id, application_id, document_type, original_filename, stored_filename, 
    file_path, file_size, mime_type, uploaded_by, verification_status
) VALUES 
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'ENG2020002'),
    'transcript',
    'jane_smith_transcript.pdf',
    'doc_' || extract(epoch from now()) || '_transcript.pdf',
    '/uploads/documents/transcripts/',
    298765,
    'application/pdf',
    (SELECT id FROM users WHERE email = 'jane.smith@student.edu'),
    'pending'
),
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'ENG2020002'),
    'personal_statement',
    'research_proposal.pdf',
    'doc_' || extract(epoch from now()) || '_research.pdf',
    '/uploads/documents/research/',
    456789,
    'application/pdf',
    (SELECT id FROM users WHERE email = 'jane.smith@student.edu'),
    'verified'
);

-- =====================================================
-- 7. SAMPLE APPROVALS DATA
-- =====================================================

-- Approvals for John Doe's application
INSERT INTO approvals (
    id, application_id, approval_step, reviewer_id, action, score, comments, reviewed_at
) VALUES 
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    'coordinator',
    (SELECT id FROM users WHERE email = 'coordinator@university.edu'),
    'approved',
    88.0,
    'Excellent academic record and strong leadership experience. Highly recommend for approval.',
    '2024-02-20 10:15:00'
),
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    'committee',
    (SELECT id FROM users WHERE email = 'committee@university.edu'),
    'approved',
    87.0,
    'Strong candidate with clear academic merit and financial need. Approved.',
    '2024-02-25 14:30:00'
),
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    'finance',
    (SELECT id FROM users WHERE email = 'finance@university.edu'),
    'approved',
    87.5,
    'Financial documentation verified. Approved for disbursement.',
    '2024-03-01 09:45:00'
);

-- Approval for Emily Brown's application
INSERT INTO approvals (
    id, application_id, approval_step, reviewer_id, action, score, comments, reviewed_at
) VALUES 
(
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'MED2021004' AND a.status = 'approved'),
    'coordinator',
    (SELECT id FROM users WHERE email = 'coordinator@university.edu'),
    'approved',
    95.0,
    'Outstanding academic performance and exceptional commitment to community service. Strongly recommend.',
    '2024-02-22 11:20:00'
);

-- =====================================================
-- 8. SAMPLE PAYMENTS DATA
-- =====================================================

-- Payment for John Doe's approved application
INSERT INTO payments (
    id, application_id, amount, status, reference_number, 
    scheduled_date, processed_by, processed_at, completed_at
) VALUES (
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    5000.00,
    'completed',
    'PAY-202403-' || UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 6)),
    '2024-03-15',
    (SELECT id FROM users WHERE email = 'finance@university.edu'),
    '2024-03-10 10:30:00',
    '2024-03-15 14:20:00'
);

-- Payment for Emily Brown's approved application
INSERT INTO payments (
    id, application_id, amount, status, reference_number, 
    scheduled_date, processed_by
) VALUES (
    uuid_generate_v4(),
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'MED2021004' AND a.status = 'approved'),
    5000.00,
    'pending',
    'PAY-202403-' || UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 6)),
    '2024-03-20',
    (SELECT id FROM users WHERE email = 'finance@university.edu')
);

-- =====================================================
-- 9. SAMPLE NOTIFICATIONS DATA
-- =====================================================

-- Notifications for students
INSERT INTO notifications (
    id, user_id, type, title, message, data, priority, action_url, is_read
) VALUES 
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'john.doe@student.edu'),
    'application_approved',
    'Congratulations! Application Approved',
    'Your application for Merit Excellence Scholarship has been approved for $5,000.',
    '{"application_id": "' || (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved') || '", "amount": 5000}'::jsonb,
    'high',
    '/applications',
    false
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'jane.smith@student.edu'),
    'application_submitted',
    'Application Submitted Successfully',
    'Your application for STEM Innovation Grant has been submitted and is under review.',
    '{"application_id": "' || (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'ENG2020002') || '"}'::jsonb,
    'medium',
    '/applications',
    true
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'david.garcia@student.edu'),
    'document_required',
    'Additional Documents Required',
    'Your application for Community Service Leadership Award requires additional documentation.',
    '{"application_id": "' || (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'ART2020005') || '"}'::jsonb,
    'high',
    '/applications',
    false
);

-- =====================================================
-- 10. UPDATE SCHOLARSHIP RECIPIENT COUNTS
-- =====================================================

-- Update scholarship recipient counts based on approved applications
UPDATE scholarships 
SET current_recipients = (
    SELECT COUNT(*)
    FROM applications a
    WHERE a.scholarship_id = scholarships.id
    AND a.status = 'approved'
);

-- =====================================================
-- 11. SAMPLE AUDIT LOGS
-- =====================================================

INSERT INTO audit_logs (
    id, user_id, user_email, user_role, action, resource_type, resource_id,
    new_values, ip_address, request_method, status_code
) VALUES 
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'john.doe@student.edu'),
    'john.doe@student.edu',
    'student',
    'CREATE',
    'application',
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    '{"scholarship_id": "merit_excellence", "status": "draft"}'::jsonb,
    '192.168.1.100',
    'POST',
    201
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'coordinator@university.edu'),
    'coordinator@university.edu',
    'coordinator',
    'APPROVE',
    'application',
    (SELECT a.id FROM applications a JOIN students s ON a.student_id = s.id WHERE s.student_id = 'CS2021001' AND a.status = 'approved'),
    '{"action": "approved", "score": 88.0}'::jsonb,
    '192.168.1.50',
    'POST',
    200
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data insertion
SELECT 'Users created: ' || COUNT(*) FROM users;
SELECT 'Students created: ' || COUNT(*) FROM students;
SELECT 'Scholarships created: ' || COUNT(*) FROM scholarships;
SELECT 'Applications created: ' || COUNT(*) FROM applications;
SELECT 'Documents uploaded: ' || COUNT(*) FROM documents;
SELECT 'Approvals recorded: ' || COUNT(*) FROM approvals;
SELECT 'Payments processed: ' || COUNT(*) FROM payments;
SELECT 'Notifications sent: ' || COUNT(*) FROM notifications;
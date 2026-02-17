-- Database Setup Script for Scholarship Management Portal
-- Run this script to set up the complete database

-- Create database and user (run as postgres superuser)
-- CREATE DATABASE scholarship_management;
-- CREATE USER scholarship_user WITH PASSWORD 'scholarship_pass';
-- GRANT ALL PRIVILEGES ON DATABASE scholarship_management TO scholarship_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create roles table first
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions) VALUES
('student', 'Student', 'Student users who can apply for scholarships', '["apply_scholarship", "view_own_applications", "upload_documents"]'::jsonb),
('coordinator', 'Department Coordinator', 'Department coordinators who manage scholarships and initial reviews', '["manage_scholarships", "review_applications", "view_department_data"]'::jsonb),
('committee', 'Scholarship Committee', 'Committee members who evaluate scholarship applications', '["review_applications", "score_applications", "view_all_applications"]'::jsonb),
('finance', 'Finance Officer', 'Finance officers who handle payments and disbursements', '["process_payments", "view_financial_reports", "manage_disbursements"]'::jsonb),
('admin', 'Administrator', 'System administrators with full access', '["*"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT chk_login_attempts CHECK (login_attempts >= 0 AND login_attempts <= 10)
);

-- Insert sample users with hashed passwords (password123 for all)
INSERT INTO users (role_id, email, password, first_name, last_name, phone, is_active, email_verified) VALUES
((SELECT id FROM roles WHERE name = 'admin'), 'admin@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'System', 'Administrator', '9876543210', true, true),
((SELECT id FROM roles WHERE name = 'coordinator'), 'coordinator@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Dr. Sarah', 'Johnson', '9876543211', true, true),
((SELECT id FROM roles WHERE name = 'committee'), 'committee@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Prof. Michael', 'Davis', '9876543212', true, true),
((SELECT id FROM roles WHERE name = 'finance'), 'finance@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Lisa', 'Chen', '9876543213', true, true),
((SELECT id FROM roles WHERE name = 'student'), 'john.doe@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'John', 'Doe', '9876543214', true, true),
((SELECT id FROM roles WHERE name = 'student'), 'jane.smith@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Jane', 'Smith', '9876543215', true, true),
((SELECT id FROM roles WHERE name = 'student'), 'emily.brown@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Emily', 'Brown', '9876543216', true, true)
ON CONFLICT (email) DO NOTHING;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    major VARCHAR(150) NOT NULL,
    year_of_study INTEGER NOT NULL,
    gpa DECIMAL(3,2),
    enrollment_date DATE NOT NULL,
    expected_graduation DATE,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    address JSONB,
    family_income DECIMAL(12,2),
    income_category VARCHAR(50),
    financial_need_score INTEGER,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_routing_number VARCHAR(20),
    account_holder_name VARCHAR(200),
    emergency_contact JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT chk_year_of_study CHECK (year_of_study >= 1 AND year_of_study <= 8),
    CONSTRAINT chk_gpa_range CHECK (gpa IS NULL OR (gpa >= 0.0 AND gpa <= 4.0)),
    CONSTRAINT chk_financial_need CHECK (financial_need_score IS NULL OR (financial_need_score >= 0 AND financial_need_score <= 100)),
    CONSTRAINT chk_income_category CHECK (income_category IN ('low', 'middle', 'high', 'not_specified')),
    CONSTRAINT chk_family_income CHECK (family_income IS NULL OR family_income >= 0)
);

-- Insert sample students
INSERT INTO students (user_id, student_id, department, major, year_of_study, gpa, enrollment_date, income_category, financial_need_score, bank_account_number, bank_name, account_holder_name) VALUES
((SELECT id FROM users WHERE email = 'john.doe@student.edu'), 'CS2021001', 'computer-science', 'Computer Science', 3, 3.85, '2021-09-01', 'middle', 65, '1234567890', 'University Credit Union', 'John Doe'),
((SELECT id FROM users WHERE email = 'jane.smith@student.edu'), 'ENG2020002', 'engineering', 'Electrical Engineering', 4, 3.92, '2020-09-01', 'low', 85, '2345678901', 'First National Bank', 'Jane Smith'),
((SELECT id FROM users WHERE email = 'emily.brown@student.edu'), 'MED2021004', 'medicine', 'Pre-Medicine', 3, 3.98, '2021-09-01', 'low', 90, '4567890123', 'University Credit Union', 'Emily Brown')
ON CONFLICT (student_id) DO NOTHING;

-- Create scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    total_funding DECIMAL(12,2) NOT NULL,
    max_recipients INTEGER NOT NULL,
    current_recipients INTEGER DEFAULT 0,
    application_start_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    award_date DATE,
    academic_year VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    min_gpa DECIMAL(3,2),
    max_gpa DECIMAL(3,2),
    year_of_study_eligible JSONB DEFAULT '[]'::jsonb,
    income_category_eligible JSONB DEFAULT '[]'::jsonb,
    nationality_requirements JSONB DEFAULT '[]'::jsonb,
    gender_requirements VARCHAR(20),
    requirements JSONB DEFAULT '[]'::jsonb,
    evaluation_criteria JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'draft',
    is_renewable BOOLEAN DEFAULT false,
    renewal_criteria JSONB,
    approval_workflow JSONB DEFAULT '["coordinator", "committee", "finance"]'::jsonb,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT chk_scholarship_amount CHECK (amount > 0),
    CONSTRAINT chk_total_funding CHECK (total_funding >= amount),
    CONSTRAINT chk_max_recipients CHECK (max_recipients > 0),
    CONSTRAINT chk_current_recipients CHECK (current_recipients >= 0 AND current_recipients <= max_recipients),
    CONSTRAINT chk_application_dates CHECK (application_deadline > application_start_date),
    CONSTRAINT chk_gpa_range_min CHECK (min_gpa IS NULL OR (min_gpa >= 0.0 AND min_gpa <= 4.0)),
    CONSTRAINT chk_gpa_range_max CHECK (max_gpa IS NULL OR (max_gpa >= 0.0 AND max_gpa <= 4.0)),
    CONSTRAINT chk_gpa_min_max CHECK (min_gpa IS NULL OR max_gpa IS NULL OR min_gpa <= max_gpa),
    CONSTRAINT chk_scholarship_status CHECK (status IN ('draft', 'active', 'closed', 'cancelled', 'suspended')),
    CONSTRAINT chk_gender_requirements CHECK (gender_requirements IN ('male', 'female', 'any', NULL))
);

-- Insert sample scholarships
INSERT INTO scholarships (name, description, amount, total_funding, max_recipients, application_start_date, application_deadline, academic_year, department, min_gpa, year_of_study_eligible, income_category_eligible, requirements, status, created_by) VALUES
('Merit Excellence Scholarship', 'Awarded to students with outstanding academic performance across all disciplines', 5000.00, 50000.00, 10, '2024-01-01', '2024-12-31', '2024-2025', 'all', 3.5, '[2, 3, 4]'::jsonb, '["low", "middle"]'::jsonb, '["Official transcript", "Two letters of recommendation", "Personal statement"]'::jsonb, 'active', (SELECT id FROM users WHERE email = 'admin@university.edu')),
('STEM Innovation Grant', 'Supporting students in STEM fields with innovative projects', 7500.00, 75000.00, 10, '2024-01-15', '2024-12-31', '2024-2025', 'computer-science', 3.2, '[2, 3, 4]'::jsonb, '["low", "middle", "high"]'::jsonb, '["Research proposal", "Faculty endorsement", "Academic transcript"]'::jsonb, 'active', (SELECT id FROM users WHERE email = 'coordinator@university.edu'))
ON CONFLICT DO NOTHING;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    academic_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    essays JSONB DEFAULT '{}'::jsonb,
    financial_info JSONB DEFAULT '{}'::jsonb,
    additional_info JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'draft',
    current_approval_step VARCHAR(20),
    approval_history JSONB DEFAULT '[]'::jsonb,
    total_score DECIMAL(5,2),
    ranking INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    special_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT chk_application_status CHECK (status IN (
        'draft', 'submitted', 'under_review', 'pending_documents', 
        'approved', 'rejected', 'withdrawn', 'on_hold'
    )),
    CONSTRAINT chk_approval_step CHECK (current_approval_step IN (
        'coordinator', 'committee', 'finance', NULL
    )),
    CONSTRAINT chk_total_score CHECK (total_score IS NULL OR (total_score >= 0 AND total_score <= 100)),
    CONSTRAINT chk_ranking CHECK (ranking IS NULL OR ranking > 0),
    CONSTRAINT uk_student_scholarship UNIQUE (student_id, scholarship_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'medium',
    expires_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_notification_type CHECK (type IN (
        'application_submitted', 'application_approved', 'application_rejected',
        'document_required', 'document_verified', 'payment_processed',
        'deadline_reminder', 'system_announcement', 'account_update', 'other'
    )),
    CONSTRAINT chk_notification_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON scholarships(status);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Success message
SELECT 'Database setup completed successfully!' as message;
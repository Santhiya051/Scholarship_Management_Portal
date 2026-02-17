-- =====================================================
-- College Scholarship Management Portal - Database Schema
-- PostgreSQL Implementation with 3NF Normalization
-- =====================================================

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ROLES TABLE - User Role Management
-- =====================================================
CREATE TABLE roles (
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

-- Create indexes for roles
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_active ON roles(is_active);

-- =====================================================
-- 2. USERS TABLE - Authentication & Basic Info
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
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
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT chk_login_attempts CHECK (login_attempts >= 0 AND login_attempts <= 10)
);

-- Create indexes for users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

-- =====================================================
-- 3. STUDENTS TABLE - Academic Profile Information
-- =====================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    major VARCHAR(150) NOT NULL,
    year_of_study INTEGER NOT NULL,
    gpa DECIMAL(3,2),
    enrollment_date DATE NOT NULL,
    expected_graduation DATE,
    
    -- Personal Information
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    
    -- Address Information (JSONB for flexibility)
    address JSONB,
    
    -- Financial Information
    family_income DECIMAL(12,2),
    income_category VARCHAR(50), -- Low, Middle, High
    financial_need_score INTEGER, -- 0-100 scale
    
    -- Bank Details for Disbursement
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_routing_number VARCHAR(20),
    account_holder_name VARCHAR(200),
    
    -- Emergency Contact
    emergency_contact JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_year_of_study CHECK (year_of_study >= 1 AND year_of_study <= 8),
    CONSTRAINT chk_gpa_range CHECK (gpa IS NULL OR (gpa >= 0.0 AND gpa <= 4.0)),
    CONSTRAINT chk_financial_need CHECK (financial_need_score IS NULL OR (financial_need_score >= 0 AND financial_need_score <= 100)),
    CONSTRAINT chk_income_category CHECK (income_category IN ('low', 'middle', 'high', 'not_specified')),
    CONSTRAINT chk_family_income CHECK (family_income IS NULL OR family_income >= 0)
);

-- Create indexes for students
CREATE UNIQUE INDEX idx_students_student_id ON students(student_id);
CREATE UNIQUE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_year_of_study ON students(year_of_study);
CREATE INDEX idx_students_gpa ON students(gpa);
CREATE INDEX idx_students_income_category ON students(income_category);

-- =====================================================
-- 4. SCHOLARSHIPS TABLE - Scholarship Programs
-- =====================================================
CREATE TABLE scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    total_funding DECIMAL(12,2) NOT NULL,
    max_recipients INTEGER NOT NULL,
    current_recipients INTEGER DEFAULT 0,
    
    -- Dates
    application_start_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    award_date DATE,
    academic_year VARCHAR(20) NOT NULL,
    
    -- Eligibility Criteria
    department VARCHAR(100), -- NULL means all departments
    min_gpa DECIMAL(3,2),
    max_gpa DECIMAL(3,2),
    year_of_study_eligible JSONB DEFAULT '[]'::jsonb, -- Array of eligible years
    income_category_eligible JSONB DEFAULT '[]'::jsonb, -- Array of eligible income categories
    nationality_requirements JSONB DEFAULT '[]'::jsonb,
    gender_requirements VARCHAR(20), -- 'male', 'female', 'any'
    
    -- Additional Requirements
    requirements JSONB DEFAULT '[]'::jsonb, -- Array of requirement strings
    evaluation_criteria JSONB DEFAULT '{}'::jsonb, -- Scoring criteria
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'draft',
    is_renewable BOOLEAN DEFAULT false,
    renewal_criteria JSONB,
    approval_workflow JSONB DEFAULT '["coordinator", "committee", "finance"]'::jsonb,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
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

-- Create indexes for scholarships
CREATE INDEX idx_scholarships_status ON scholarships(status);
CREATE INDEX idx_scholarships_department ON scholarships(department);
CREATE INDEX idx_scholarships_deadline ON scholarships(application_deadline);
CREATE INDEX idx_scholarships_academic_year ON scholarships(academic_year);
CREATE INDEX idx_scholarships_created_by ON scholarships(created_by);
CREATE INDEX idx_scholarships_amount ON scholarships(amount);

-- =====================================================
-- 5. APPLICATIONS TABLE - Scholarship Applications
-- =====================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    
    -- Application Data (JSONB for flexibility)
    personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    academic_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    essays JSONB DEFAULT '{}'::jsonb,
    financial_info JSONB DEFAULT '{}'::jsonb,
    additional_info JSONB DEFAULT '{}'::jsonb,
    
    -- Status and Workflow
    status VARCHAR(30) DEFAULT 'draft',
    current_approval_step VARCHAR(20),
    approval_history JSONB DEFAULT '[]'::jsonb,
    
    -- Scoring and Ranking
    total_score DECIMAL(5,2),
    ranking INTEGER,
    
    -- Important Dates
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    
    -- Decision Information
    rejection_reason TEXT,
    special_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_application_status CHECK (status IN (
        'draft', 'submitted', 'under_review', 'pending_documents', 
        'approved', 'rejected', 'withdrawn', 'on_hold'
    )),
    CONSTRAINT chk_approval_step CHECK (current_approval_step IN (
        'coordinator', 'committee', 'finance', NULL
    )),
    CONSTRAINT chk_total_score CHECK (total_score IS NULL OR (total_score >= 0 AND total_score <= 100)),
    CONSTRAINT chk_ranking CHECK (ranking IS NULL OR ranking > 0),
    
    -- Unique constraint: one application per student per scholarship
    CONSTRAINT uk_student_scholarship UNIQUE (student_id, scholarship_id)
);

-- Create indexes for applications
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_scholarship_id ON applications(scholarship_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_approval_step ON applications(current_approval_step);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_applications_total_score ON applications(total_score);
CREATE INDEX idx_applications_ranking ON applications(ranking);

-- =====================================================
-- 6. DOCUMENTS TABLE - Application Documents
-- =====================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Document Information
    document_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Upload Information
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Verification Status
    verification_status VARCHAR(20) DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Document Metadata
    is_required BOOLEAN DEFAULT true,
    document_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_document_type CHECK (document_type IN (
        'transcript', 'recommendation_letter', 'personal_statement', 
        'financial_statement', 'enrollment_proof', 'id_document', 
        'income_certificate', 'caste_certificate', 'other'
    )),
    CONSTRAINT chk_verification_status CHECK (verification_status IN (
        'pending', 'verified', 'rejected', 'requires_resubmission'
    )),
    CONSTRAINT chk_file_size CHECK (file_size > 0 AND file_size <= 10485760) -- 10MB limit
);

-- Create indexes for documents
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_verification_status ON documents(verification_status);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_verified_by ON documents(verified_by);

-- =====================================================
-- 7. APPROVALS TABLE - Multi-level Approval Workflow
-- =====================================================
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Approval Information
    approval_step VARCHAR(20) NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(20) NOT NULL,
    
    -- Scoring (if applicable)
    score DECIMAL(5,2),
    criteria_scores JSONB DEFAULT '{}'::jsonb,
    
    -- Comments and Feedback
    comments TEXT,
    internal_notes TEXT, -- Not visible to students
    
    -- Timing Information
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_spent_minutes INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_approval_step CHECK (approval_step IN (
        'coordinator', 'committee', 'finance', 'admin'
    )),
    CONSTRAINT chk_approval_action CHECK (action IN (
        'approved', 'rejected', 'returned', 'on_hold'
    )),
    CONSTRAINT chk_approval_score CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    CONSTRAINT chk_time_spent CHECK (time_spent_minutes IS NULL OR time_spent_minutes >= 0)
);

-- Create indexes for approvals
CREATE INDEX idx_approvals_application_id ON approvals(application_id);
CREATE INDEX idx_approvals_step ON approvals(approval_step);
CREATE INDEX idx_approvals_reviewer_id ON approvals(reviewer_id);
CREATE INDEX idx_approvals_action ON approvals(action);
CREATE INDEX idx_approvals_reviewed_at ON approvals(reviewed_at);

-- =====================================================
-- 8. PAYMENTS TABLE - Financial Disbursements
-- =====================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE RESTRICT,
    
    -- Payment Information
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(30) DEFAULT 'bank_transfer',
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Transaction Details
    transaction_id VARCHAR(100) UNIQUE,
    reference_number VARCHAR(50) UNIQUE,
    batch_id VARCHAR(50), -- For bulk processing
    
    -- Bank Details (can override student's bank details)
    bank_details JSONB,
    
    -- Processing Information
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Important Dates
    scheduled_date DATE,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Failure Information
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Additional Information
    notes TEXT,
    payment_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_status CHECK (status IN (
        'pending', 'approved', 'processing', 'completed', 
        'failed', 'cancelled', 'on_hold'
    )),
    CONSTRAINT chk_payment_method CHECK (payment_method IN (
        'bank_transfer', 'check', 'direct_deposit', 'digital_wallet', 'other'
    )),
    CONSTRAINT chk_retry_count CHECK (retry_count >= 0 AND retry_count <= 5)
);

-- Create indexes for payments
CREATE UNIQUE INDEX idx_payments_application_id ON payments(application_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_processed_by ON payments(processed_by);
CREATE INDEX idx_payments_scheduled_date ON payments(scheduled_date);
CREATE INDEX idx_payments_completed_at ON payments(completed_at);
CREATE UNIQUE INDEX idx_payments_transaction_id ON payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- =====================================================
-- 9. NOTIFICATIONS TABLE - System Notifications
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Notification Data (for dynamic content)
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority and Expiration
    priority VARCHAR(10) DEFAULT 'medium',
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Action Information
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    
    -- Email Status
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_notification_type CHECK (type IN (
        'application_submitted', 'application_approved', 'application_rejected',
        'document_required', 'document_verified', 'payment_processed',
        'deadline_reminder', 'system_announcement', 'account_update', 'other'
    )),
    CONSTRAINT chk_notification_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- =====================================================
-- 10. AUDIT_LOGS TABLE - System Audit Trail
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Stored for reference even if user is deleted
    user_role VARCHAR(50),
    
    -- Action Information
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Change Information
    old_values JSONB,
    new_values JSONB,
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    
    -- Response Information
    status_code INTEGER,
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_audit_action CHECK (action IN (
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
        'SUBMIT', 'APPROVE', 'REJECT', 'UPLOAD', 'DOWNLOAD', 'VIEW'
    )),
    CONSTRAINT chk_audit_resource_type CHECK (resource_type IN (
        'user', 'student', 'scholarship', 'application', 'document', 
        'approval', 'payment', 'notification', 'system'
    ))
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
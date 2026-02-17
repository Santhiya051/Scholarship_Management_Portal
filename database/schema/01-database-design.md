# College Scholarship Management Portal - Database Design

## 🎯 Database Architecture Overview

This database design follows **Third Normal Form (3NF)** principles to ensure data integrity, minimize redundancy, and optimize performance for a college-level scholarship management system.

## 📊 Entity Relationship Diagram (ASCII Format)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    ROLES    │    │    USERS    │    │  STUDENTS   │
│─────────────│    │─────────────│    │─────────────│
│ id (PK)     │◄──┤ id (PK)     │───►│ id (PK)     │
│ name        │    │ role_id(FK) │    │ user_id(FK) │
│ display_name│    │ email       │    │ student_id  │
│ permissions │    │ password    │    │ department  │
│ is_active   │    │ first_name  │    │ gpa         │
└─────────────┘    │ last_name   │    │ year_study  │
                   │ is_active   │    │ income      │
                   └─────────────┘    └─────────────┘
                          │                   │
                          │                   │
┌─────────────┐          │                   │          ┌─────────────┐
│SCHOLARSHIPS │          │                   │          │APPLICATION  │
│─────────────│          │                   │          │─────────────│
│ id (PK)     │          │                   └─────────►│ id (PK)     │
│ name        │          │                              │ student_id  │
│ description │          │                              │ scholarship │
│ amount      │          │                              │ status      │
│ deadline    │          │                              │ submitted_at│
│ eligibility │          │                              │ score       │
│ created_by  │◄─────────┘                              └─────────────┘
│ status      │                                                │
└─────────────┘                                                │
       │                                                       │
       │              ┌─────────────┐                         │
       └─────────────►│ DOCUMENTS   │◄────────────────────────┘
                      │─────────────│
                      │ id (PK)     │
                      │ app_id (FK) │
                      │ doc_type    │
                      │ file_path   │
                      │ verified    │
                      └─────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  APPROVALS  │    │  PAYMENTS   │    │NOTIFICATIONS│
│─────────────│    │─────────────│    │─────────────│
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ app_id (FK) │    │ app_id (FK) │    │ user_id(FK) │
│ reviewer_id │    │ amount      │    │ type        │
│ action      │    │ status      │    │ message     │
│ comments    │    │ ref_number  │    │ is_read     │
│ reviewed_at │    │ processed   │    │ created_at  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🗂️ Table Relationships & Cardinality

### Primary Relationships
- **Users** (1) ←→ (1) **Students** - One-to-One
- **Roles** (1) ←→ (N) **Users** - One-to-Many
- **Users** (1) ←→ (N) **Scholarships** (created_by) - One-to-Many
- **Students** (1) ←→ (N) **Applications** - One-to-Many
- **Scholarships** (1) ←→ (N) **Applications** - One-to-Many
- **Applications** (1) ←→ (N) **Documents** - One-to-Many
- **Applications** (1) ←→ (N) **Approvals** - One-to-Many
- **Applications** (1) ←→ (1) **Payments** - One-to-One
- **Users** (1) ←→ (N) **Notifications** - One-to-Many

## 🔐 Security & Integrity Features

### Data Security
- **Password Hashing**: bcrypt with salt rounds
- **Soft Deletes**: Paranoid deletion with deleted_at timestamps
- **Audit Trail**: Complete logging of all data changes
- **Role-Based Access**: Granular permission system

### Data Integrity
- **Foreign Key Constraints**: Referential integrity enforcement
- **Check Constraints**: Data validation at database level
- **Unique Constraints**: Prevent duplicate critical data
- **NOT NULL Constraints**: Required field enforcement

## 📈 Performance Optimization

### Indexing Strategy
- **Primary Keys**: Clustered indexes on all PKs
- **Foreign Keys**: Non-clustered indexes on all FKs
- **Search Fields**: Indexes on frequently searched columns
- **Composite Indexes**: Multi-column indexes for complex queries

### Query Optimization
- **Normalized Design**: Reduces data redundancy
- **Proper Data Types**: Optimal storage and performance
- **Partitioning Ready**: Designed for future partitioning needs

## 🎯 Business Rules Enforced

### Application Rules
- One student can apply for multiple scholarships
- One application per student per scholarship
- Applications must be submitted before deadline
- Documents required before approval

### Approval Workflow
- Multi-level approval: Coordinator → Committee → Finance
- Each level can approve, reject, or request changes
- Approval history maintained for audit

### Payment Rules
- Payments only for approved applications
- One payment per approved application
- Payment status tracking throughout process

## 📊 Data Normalization

### First Normal Form (1NF)
- All attributes contain atomic values
- No repeating groups or arrays
- Each row is unique

### Second Normal Form (2NF)
- Meets 1NF requirements
- No partial dependencies on composite keys
- All non-key attributes depend on entire primary key

### Third Normal Form (3NF)
- Meets 2NF requirements
- No transitive dependencies
- All non-key attributes depend only on primary key

## 🔄 Data Flow Architecture

### Application Lifecycle
1. **Student Registration** → Users + Students tables
2. **Scholarship Creation** → Scholarships table
3. **Application Submission** → Applications + Documents tables
4. **Review Process** → Approvals table (multi-step)
5. **Payment Processing** → Payments table
6. **Notifications** → Notifications table (throughout process)

### Audit & Compliance
- All changes logged in audit_logs table
- Timestamp tracking on all operations
- User attribution for all actions
- Soft delete capability for data retention
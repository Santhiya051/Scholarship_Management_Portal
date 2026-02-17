# API Request/Response Examples

## 🔐 Authentication Examples

### 1. User Registration (Student)
**Request:**
```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "john.doe@student.edu",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0123",
  "student_id": "CS2024001",
  "department": "computer-science",
  "major": "Computer Science",
  "year_of_study": 2,
  "gpa": 3.75
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@student.edu",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1-555-0123",
      "is_active": true,
      "email_verified": false,
      "role": {
        "id": "role-uuid",
        "name": "student",
        "display_name": "Student"
      },
      "created_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 2. User Login
**Request:**
```javascript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@student.edu",
  "password": "SecurePass123!"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@student.edu",
      "first_name": "John",
      "last_name": "Doe",
      "role": {
        "name": "student",
        "display_name": "Student",
        "permissions": ["apply_scholarship", "view_own_applications"]
      },
      "last_login": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

## 🎓 Scholarship Examples

### 3. Get Scholarships (Student View)
**Request:**
```javascript
GET /api/v1/scholarships?page=1&limit=10&department=computer-science&status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "scholarships": [
      {
        "id": "scholarship-uuid-1",
        "name": "Merit Excellence Scholarship",
        "description": "Awarded to students with outstanding academic performance...",
        "amount": 5000.00,
        "application_deadline": "2024-03-15T23:59:59Z",
        "academic_year": "2024-2025",
        "department": "all",
        "min_gpa": 3.5,
        "status": "active",
        "is_eligible": true,
        "has_applied": false,
        "requirements": [
          "Official transcript",
          "Two letters of recommendation",
          "Personal statement"
        ],
        "creator": {
          "first_name": "Dr. Sarah",
          "last_name": "Johnson"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

### 4. Create Scholarship (Admin/Coordinator)
**Request:**
```javascript
POST /api/v1/scholarships
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "STEM Innovation Grant",
  "description": "Supporting students in STEM fields with innovative projects",
  "amount": 7500.00,
  "total_funding": 75000.00,
  "max_recipients": 10,
  "application_start_date": "2024-01-15",
  "application_deadline": "2024-04-01",
  "academic_year": "2024-2025",
  "department": "computer-science",
  "min_gpa": 3.2,
  "year_of_study_eligible": [2, 3, 4],
  "income_category_eligible": ["low", "middle"],
  "requirements": [
    "Research proposal",
    "Faculty endorsement",
    "Academic transcript"
  ]
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Scholarship created successfully",
  "data": {
    "scholarship": {
      "id": "new-scholarship-uuid",
      "name": "STEM Innovation Grant",
      "description": "Supporting students in STEM fields with innovative projects",
      "amount": 7500.00,
      "total_funding": 75000.00,
      "max_recipients": 10,
      "current_recipients": 0,
      "application_deadline": "2024-04-01T23:59:59Z",
      "status": "draft",
      "created_by": "admin-user-uuid",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 📝 Application Examples

### 5. Create Application
**Request:**
```javascript
POST /api/v1/applications
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "scholarship_id": "scholarship-uuid-1",
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@student.edu",
    "phone": "+1-555-0123",
    "address": {
      "street": "123 Main St",
      "city": "University City",
      "state": "CA",
      "zip": "90210"
    }
  },
  "academic_info": {
    "student_id": "CS2024001",
    "gpa": 3.75,
    "major": "Computer Science",
    "year_of_study": 2,
    "expected_graduation": "2026-05-15"
  },
  "essays": {
    "personal_statement": "My passion for computer science began...",
    "leadership_essay": "Throughout my academic journey, I have..."
  },
  "financial_info": {
    "family_income": 45000,
    "financial_need_explanation": "As a middle-income family..."
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "application": {
      "id": "application-uuid-1",
      "student_id": "student-uuid-1",
      "scholarship_id": "scholarship-uuid-1",
      "status": "draft",
      "created_at": "2024-01-15T10:30:00Z",
      "scholarship": {
        "name": "Merit Excellence Scholarship",
        "amount": 5000.00
      },
      "student": {
        "user": {
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    }
  }
}
```

### 6. Submit Application
**Request:**
```javascript
POST /api/v1/applications/application-uuid-1/submit
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```javascript
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "id": "application-uuid-1",
      "status": "submitted",
      "submitted_at": "2024-01-15T10:30:00Z",
      "current_approval_step": "coordinator"
    }
  }
}
```

### 7. Review Application (Coordinator/Committee)
**Request:**
```javascript
POST /api/v1/applications/application-uuid-1/review
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "approved",
  "score": 88.5,
  "comments": "Excellent academic record and strong leadership experience. Highly recommend for approval.",
  "criteria_scores": {
    "academic_performance": 90,
    "leadership": 85,
    "financial_need": 90,
    "essay_quality": 88
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "application": {
      "id": "application-uuid-1",
      "status": "under_review",
      "current_approval_step": "committee",
      "total_score": 88.5
    },
    "approval": {
      "id": "approval-uuid-1",
      "approval_step": "coordinator",
      "action": "approved",
      "score": 88.5,
      "reviewed_at": "2024-01-20T14:30:00Z"
    }
  }
}
```

## 📄 Document Upload Examples

### 8. Upload Document
**Request:**
```javascript
POST /api/v1/documents/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

FormData:
- file: [File object]
- application_id: "application-uuid-1"
- document_type: "transcript"
```

**Response:**
```javascript
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "document-uuid-1",
      "application_id": "application-uuid-1",
      "document_type": "transcript",
      "original_filename": "john_doe_transcript.pdf",
      "file_size": 245760,
      "verification_status": "pending",
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 9. Verify Document (Coordinator/Admin)
**Request:**
```javascript
PUT /api/v1/documents/document-uuid-1/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "verification_status": "verified",
  "verification_notes": "Document is authentic and meets requirements"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Document verified successfully",
  "data": {
    "document": {
      "id": "document-uuid-1",
      "verification_status": "verified",
      "verified_by": "coordinator-uuid",
      "verified_at": "2024-01-16T09:15:00Z",
      "verification_notes": "Document is authentic and meets requirements"
    }
  }
}
```

## 💰 Payment Examples

### 10. Get Payments (Finance Officer)
**Request:**
```javascript
GET /api/v1/payments?status=pending&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-uuid-1",
        "application_id": "application-uuid-1",
        "amount": 5000.00,
        "status": "pending",
        "reference_number": "PAY-202401-ABC123",
        "scheduled_date": "2024-01-25",
        "created_at": "2024-01-20T10:30:00Z",
        "application": {
          "student": {
            "user": {
              "first_name": "John",
              "last_name": "Doe"
            },
            "student_id": "CS2024001",
            "bank_account_number": "****7890"
          },
          "scholarship": {
            "name": "Merit Excellence Scholarship"
          }
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "items_per_page": 10
    }
  }
}
```

### 11. Process Payment
**Request:**
```javascript
POST /api/v1/payments/payment-uuid-1/process
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "transaction_id": "TXN-20240125-001",
  "notes": "Payment processed via ACH transfer"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "id": "payment-uuid-1",
      "status": "completed",
      "transaction_id": "TXN-20240125-001",
      "processed_at": "2024-01-25T14:30:00Z",
      "completed_at": "2024-01-25T14:30:00Z"
    }
  }
}
```

## 🔔 Notification Examples

### 12. Get Notifications
**Request:**
```javascript
GET /api/v1/notifications?is_read=false&page=1&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-uuid-1",
        "type": "application_approved",
        "title": "Congratulations! Application Approved",
        "message": "Your application for Merit Excellence Scholarship has been approved for $5,000.",
        "data": {
          "application_id": "application-uuid-1",
          "scholarship_name": "Merit Excellence Scholarship",
          "amount": 5000
        },
        "priority": "high",
        "is_read": false,
        "action_url": "/applications/application-uuid-1",
        "created_at": "2024-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 3,
      "items_per_page": 5
    }
  }
}
```

## ❌ Error Response Examples

### Validation Error
```javascript
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "gpa",
      "message": "GPA must be between 0.0 and 4.0"
    }
  ]
}
```

### Authentication Error
```javascript
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Authorization Error
```javascript
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Not Found Error
```javascript
{
  "success": false,
  "message": "Scholarship not found"
}
```

### Server Error
```javascript
{
  "success": false,
  "message": "Internal server error"
}
```
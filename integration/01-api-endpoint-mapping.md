# API Endpoint Mapping & Integration Guide

## 🎯 Complete API Endpoint Reference

### Authentication Endpoints
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| POST | `/api/v1/auth/register` | `authService.register()` | `authController.register` | Student registration |
| POST | `/api/v1/auth/login` | `authService.login()` | `authController.login` | User authentication |
| POST | `/api/v1/auth/refresh-token` | `authService.refreshToken()` | `authController.refreshToken` | Token refresh |
| POST | `/api/v1/auth/logout` | `authService.logout()` | `authController.logout` | User logout |
| GET | `/api/v1/auth/profile` | `authService.getProfile()` | `authController.getProfile` | Get user profile |
| PUT | `/api/v1/auth/profile` | `authService.updateProfile()` | `authController.updateProfile` | Update profile |
| PUT | `/api/v1/auth/change-password` | `authService.changePassword()` | `authController.changePassword` | Change password |
| GET | `/api/v1/auth/verify-token` | `authService.verifyToken()` | `authController.verifyToken` | Verify JWT token |

### Scholarship Endpoints
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| GET | `/api/v1/scholarships` | `scholarshipService.getScholarships()` | `scholarshipController.getScholarships` | List scholarships with filters |
| GET | `/api/v1/scholarships/:id` | `scholarshipService.getScholarshipById()` | `scholarshipController.getScholarshipById` | Get single scholarship |
| POST | `/api/v1/scholarships` | `scholarshipService.createScholarship()` | `scholarshipController.createScholarship` | Create scholarship (admin/coord) |
| PUT | `/api/v1/scholarships/:id` | `scholarshipService.updateScholarship()` | `scholarshipController.updateScholarship` | Update scholarship |
| DELETE | `/api/v1/scholarships/:id` | `scholarshipService.deleteScholarship()` | `scholarshipController.deleteScholarship` | Delete scholarship (admin) |
| GET | `/api/v1/scholarships/stats/overview` | `scholarshipService.getStats()` | `scholarshipController.getScholarshipStats` | Get statistics |

### Application Endpoints
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| GET | `/api/v1/applications` | `applicationService.getApplications()` | `applicationController.getApplications` | List applications (role-filtered) |
| GET | `/api/v1/applications/:id` | `applicationService.getApplicationById()` | `applicationController.getApplicationById` | Get single application |
| POST | `/api/v1/applications` | `applicationService.createApplication()` | `applicationController.createApplication` | Create application (student) |
| PUT | `/api/v1/applications/:id` | `applicationService.updateApplication()` | `applicationController.updateApplication` | Update application |
| POST | `/api/v1/applications/:id/submit` | `applicationService.submitApplication()` | `applicationController.submitApplication` | Submit for review |
| POST | `/api/v1/applications/:id/review` | `applicationService.reviewApplication()` | `applicationController.reviewApplication` | Approve/reject |
| POST | `/api/v1/applications/:id/withdraw` | `applicationService.withdrawApplication()` | `applicationController.withdrawApplication` | Withdraw application |
| GET | `/api/v1/applications/stats/overview` | `applicationService.getStats()` | `applicationController.getApplicationStats` | Get statistics |

### Document Endpoints
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| POST | `/api/v1/documents/upload` | `documentService.uploadDocument()` | `documentController.uploadDocument` | Upload document |
| GET | `/api/v1/documents/:id/download` | `documentService.downloadDocument()` | `documentController.downloadDocument` | Download document |
| PUT | `/api/v1/documents/:id/verify` | `documentService.verifyDocument()` | `documentController.verifyDocument` | Verify document |
| DELETE | `/api/v1/documents/:id` | `documentService.deleteDocument()` | `documentController.deleteDocument` | Delete document |

### Payment Endpoints
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| GET | `/api/v1/payments` | `paymentService.getPayments()` | `paymentController.getPayments` | List payments |
| GET | `/api/v1/payments/:id` | `paymentService.getPaymentById()` | `paymentController.getPaymentById` | Get single payment |
| POST | `/api/v1/payments/:id/process` | `paymentService.processPayment()` | `paymentController.processPayment` | Process payment |
| PUT | `/api/v1/payments/:id/status` | `paymentService.updateStatus()` | `paymentController.updatePaymentStatus` | Update status |

### Notification Endpoints
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| GET | `/api/v1/notifications` | `notificationService.getNotifications()` | `notificationController.getNotifications` | List notifications |
| PUT | `/api/v1/notifications/:id/read` | `notificationService.markAsRead()` | `notificationController.markAsRead` | Mark as read |
| DELETE | `/api/v1/notifications/:id` | `notificationService.deleteNotification()` | `notificationController.deleteNotification` | Delete notification |

### User Management Endpoints (Admin)
| Method | Endpoint | Frontend Service | Controller | Purpose |
|--------|----------|------------------|------------|---------|
| GET | `/api/v1/users` | `userService.getUsers()` | `userController.getUsers` | List users (admin) |
| GET | `/api/v1/users/:id` | `userService.getUserById()` | `userController.getUserById` | Get single user |
| POST | `/api/v1/users` | `userService.createUser()` | `userController.createUser` | Create user (admin) |
| PUT | `/api/v1/users/:id` | `userService.updateUser()` | `userController.updateUser` | Update user |
| PUT | `/api/v1/users/:id/status` | `userService.updateStatus()` | `userController.updateUserStatus` | Activate/deactivate |

## 🔐 Authentication Flow

### JWT Token Structure
```javascript
// Access Token Payload
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "student",
  "iat": 1640995200,
  "exp": 1641081600
}

// Refresh Token Payload
{
  "userId": "uuid",
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Frontend Auth Flow
```javascript
// 1. Login Request
const response = await authService.login({ email, password });
// 2. Store tokens
localStorage.setItem('token', response.data.tokens.access_token);
localStorage.setItem('refreshToken', response.data.tokens.refresh_token);
// 3. Set user context
setUser(response.data.user);
// 4. Redirect to dashboard
navigate('/dashboard');
```

### Backend Auth Middleware
```javascript
// 1. Extract token from header
const token = req.headers.authorization?.split(' ')[1];
// 2. Verify JWT
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// 3. Get user with role
const user = await User.findByPk(decoded.userId, { include: Role });
// 4. Attach to request
req.user = user;
```

## 📊 Database Model Mapping

### Frontend ↔ Backend ↔ Database
| Frontend State | Backend Model | Database Table | Key Fields |
|----------------|---------------|----------------|------------|
| `user` | `User` | `users` | id, email, role_id, first_name, last_name |
| `student` | `Student` | `students` | id, user_id, student_id, gpa, department |
| `scholarship` | `Scholarship` | `scholarships` | id, name, amount, deadline, status |
| `application` | `Application` | `applications` | id, student_id, scholarship_id, status |
| `document` | `Document` | `documents` | id, application_id, file_path, verification_status |
| `payment` | `Payment` | `payments` | id, application_id, amount, status |
| `notification` | `Notification` | `notifications` | id, user_id, type, message, is_read |

## 🔄 Status Synchronization

### Application Status Flow
```
Frontend → Backend → Database → Triggers → Notifications → Frontend
```

1. **Frontend**: User submits application
2. **Backend**: Validates and updates status
3. **Database**: Triggers fire for status change
4. **Notifications**: Auto-created via triggers
5. **Frontend**: Polls for updates or WebSocket notification

### Real-time Updates Strategy
```javascript
// Option 1: Polling (Current Implementation)
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000); // Poll every 30 seconds
  return () => clearInterval(interval);
}, []);

// Option 2: WebSocket (Future Enhancement)
const socket = io(process.env.REACT_APP_WS_URL);
socket.on('notification', (notification) => {
  setNotifications(prev => [notification, ...prev]);
});
```

## 📁 File Upload Integration

### Frontend File Upload
```javascript
const uploadDocument = async (file, applicationId, documentType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  
  return await api.post(`/applications/${applicationId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### Backend File Handling
```javascript
// Multer configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'png'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext.substring(1)));
  }
});
```

### Database File Storage
```sql
-- Documents table stores metadata
INSERT INTO documents (
  application_id, document_type, original_filename, 
  stored_filename, file_path, file_size, mime_type
) VALUES (?, ?, ?, ?, ?, ?, ?);
```

## 🎯 Role-Based Access Control

### Frontend Route Protection
```javascript
// Protected route with role check
<ProtectedRoute allowedRoles={['admin', 'coordinator']}>
  <ScholarshipManagement />
</ProtectedRoute>

// Component-level permission check
{user?.role?.name === 'admin' && (
  <button onClick={deleteScholarship}>Delete</button>
)}
```

### Backend Permission Middleware
```javascript
// Role-based middleware
const requireRole = (roles) => (req, res, next) => {
  const userRole = req.user.role.name;
  if (!roles.includes(userRole)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// Usage in routes
router.post('/scholarships', 
  authenticateToken, 
  requireRole(['admin', 'coordinator']), 
  createScholarship
);
```

### Database Role Enforcement
```sql
-- Role-based data filtering in queries
SELECT * FROM applications a
JOIN students s ON a.student_id = s.id
WHERE (
  -- Students see only their applications
  (user_role = 'student' AND s.user_id = current_user_id) OR
  -- Coordinators see department applications
  (user_role = 'coordinator' AND s.department = user_department) OR
  -- Admin sees all
  (user_role = 'admin')
);
```
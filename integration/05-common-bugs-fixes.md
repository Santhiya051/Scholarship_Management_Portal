# Common Integration Bugs & Fixes

## 🐛 Authentication Issues

### 1. Token Expiry Not Handled
**Problem:**
```javascript
// User gets 401 errors but no automatic refresh
axios.get('/api/scholarships')
  .catch(error => {
    // 401 error but user stays logged in
    console.error('Request failed:', error);
  });
```

**Fix:**
```javascript
// Proper axios interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post('/auth/refresh-token', {
          refresh_token: refreshToken
        });
        
        const { access_token } = response.data.tokens;
        localStorage.setItem('token', access_token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 2. Role-Based Access Not Synced
**Problem:**
```javascript
// Frontend shows admin menu but backend rejects requests
{user?.role === 'admin' && (
  <AdminMenu /> // Shows even if role changed on backend
)}
```

**Fix:**
```javascript
// Always verify current user role from backend
useEffect(() => {
  const verifyUserRole = async () => {
    try {
      const { data } = await authService.getProfile();
      if (data.user.role.name !== user.role.name) {
        // Role changed, update context
        setUser(data.user);
      }
    } catch (error) {
      // Token invalid, logout
      logout();
    }
  };
  
  // Verify role every 5 minutes
  const interval = setInterval(verifyUserRole, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [user]);
```

### 3. Concurrent Login Sessions
**Problem:**
```javascript
// Multiple tabs with different tokens cause conflicts
localStorage.setItem('token', newToken); // Only affects current tab
```

**Fix:**
```javascript
// Listen for storage changes across tabs
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'token') {
      if (e.newValue === null) {
        // Token removed in another tab, logout
        logout();
      } else if (e.newValue !== e.oldValue) {
        // Token changed in another tab, update
        window.location.reload();
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

## 📝 Form & Validation Issues

### 4. Frontend/Backend Validation Mismatch
**Problem:**
```javascript
// Frontend allows submission but backend rejects
const schema = Joi.object({
  gpa: Joi.number().min(0).max(4.0) // Backend
});

// Frontend validation
const isValid = gpa >= 0 && gpa <= 5.0; // Different max!
```

**Fix:**
```javascript
// Shared validation schemas
// shared/validationSchemas.js
export const gpaValidation = {
  min: 0,
  max: 4.0,
  joi: Joi.number().min(0).max(4.0),
  frontend: (value) => value >= 0 && value <= 4.0
};

// Frontend
import { gpaValidation } from '../shared/validationSchemas';
const isValid = gpaValidation.frontend(gpa);

// Backend
import { gpaValidation } from '../shared/validationSchemas';
const schema = Joi.object({
  gpa: gpaValidation.joi
});
```

### 5. File Upload Size Limits Not Synced
**Problem:**
```javascript
// Frontend allows 10MB but backend limits to 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Frontend
// Backend multer limits to 5MB
```

**Fix:**
```javascript
// Environment-based configuration
// .env
MAX_FILE_SIZE=5242880

// Frontend
const MAX_FILE_SIZE = parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 5242880;

// Backend
const upload = multer({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880
  }
});
```

### 6. Date Format Inconsistencies
**Problem:**
```javascript
// Frontend sends MM/DD/YYYY but backend expects YYYY-MM-DD
const deadline = '03/15/2024'; // Frontend format
// Backend validation fails
```

**Fix:**
```javascript
// Standardize on ISO format
// Frontend
const formatDateForAPI = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Backend
const parseDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date;
};
```

## 🔄 State Management Issues

### 7. Stale Data After Updates
**Problem:**
```javascript
// User updates application but list doesn't refresh
const updateApplication = async (id, data) => {
  await applicationService.updateApplication(id, data);
  // List still shows old data
};
```

**Fix:**
```javascript
// Optimistic updates with error handling
const updateApplication = async (id, data) => {
  // Optimistically update UI
  setApplications(prev => 
    prev.map(app => 
      app.id === id ? { ...app, ...data } : app
    )
  );
  
  try {
    const response = await applicationService.updateApplication(id, data);
    // Update with server response
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? response.data.application : app
      )
    );
  } catch (error) {
    // Revert on error
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? originalApplication : app
      )
    );
    throw error;
  }
};
```

### 8. Memory Leaks from Subscriptions
**Problem:**
```javascript
// Polling continues after component unmount
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000);
  // Missing cleanup!
}, []);
```

**Fix:**
```javascript
// Proper cleanup
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000);
  
  return () => {
    clearInterval(interval); // Cleanup on unmount
  };
}, []);

// Or use custom hook
const usePolling = (callback, interval) => {
  useEffect(() => {
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval]);
};
```

## 🗄️ Database & API Issues

### 9. N+1 Query Problems
**Problem:**
```javascript
// Gets applications, then queries for each scholarship separately
const applications = await Application.findAll();
for (const app of applications) {
  app.scholarship = await Scholarship.findByPk(app.scholarship_id);
}
```

**Fix:**
```javascript
// Use proper includes/joins
const applications = await Application.findAll({
  include: [
    {
      model: Scholarship,
      as: 'scholarship'
    },
    {
      model: Student,
      as: 'student',
      include: [{
        model: User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'email']
      }]
    }
  ]
});
```

### 10. Race Conditions in Status Updates
**Problem:**
```javascript
// Multiple users updating same application simultaneously
const application = await Application.findByPk(id);
application.status = 'approved'; // Could overwrite other changes
await application.save();
```

**Fix:**
```javascript
// Use optimistic locking or atomic updates
const [updatedRows] = await Application.update(
  { status: 'approved' },
  { 
    where: { 
      id: id,
      status: 'under_review' // Only update if still under review
    }
  }
);

if (updatedRows === 0) {
  throw new Error('Application status has changed, please refresh');
}
```

### 11. Inconsistent Error Responses
**Problem:**
```javascript
// Different error formats across endpoints
res.status(400).json({ error: 'Bad request' }); // Endpoint 1
res.status(400).json({ message: 'Validation failed' }); // Endpoint 2
```

**Fix:**
```javascript
// Standardized error response format
const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

// Usage
sendError(res, 400, 'Validation failed', validationErrors);
sendError(res, 404, 'Application not found');
```

## 📁 File Upload Issues

### 12. File Path Security Vulnerabilities
**Problem:**
```javascript
// Direct file path exposure
res.sendFile(document.file_path); // Exposes server structure
```

**Fix:**
```javascript
// Secure file serving
router.get('/documents/:id/download', async (req, res) => {
  const document = await Document.findByPk(req.params.id);
  
  // Verify user has access
  if (!canUserAccessDocument(req.user, document)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Serve file without exposing path
  res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
  res.sendFile(path.resolve(document.file_path));
});
```

### 13. File Upload Progress Not Shown
**Problem:**
```javascript
// No progress feedback for large files
const uploadFile = async (file) => {
  return await api.post('/documents/upload', formData);
  // User sees nothing during upload
};
```

**Fix:**
```javascript
// Add upload progress tracking
const uploadFile = async (file, onProgress) => {
  return await api.post('/documents/upload', formData, {
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(progress);
    }
  });
};

// Usage in component
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (file) => {
  try {
    await uploadFile(file, setUploadProgress);
  } catch (error) {
    setUploadProgress(0);
  }
};
```

## 🔔 Notification Issues

### 14. Email Notifications Not Sent
**Problem:**
```javascript
// Database trigger creates notification but email fails silently
CREATE TRIGGER notify_user AFTER UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION create_notification();
```

**Fix:**
```javascript
// Separate email queue with retry logic
const sendEmailNotification = async (notification) => {
  try {
    await emailService.sendEmail(notification);
    await notification.update({ email_sent: true });
  } catch (error) {
    console.error('Email failed:', error);
    // Add to retry queue
    await EmailQueue.create({
      notification_id: notification.id,
      retry_count: 0,
      next_retry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
  }
};
```

### 15. Notification Polling Overload
**Problem:**
```javascript
// Every user polls every 10 seconds
setInterval(fetchNotifications, 10000); // Too frequent!
```

**Fix:**
```javascript
// Exponential backoff and smart polling
const useSmartPolling = (callback, baseInterval = 30000) => {
  const [interval, setInterval] = useState(baseInterval);
  
  useEffect(() => {
    let timeoutId;
    
    const poll = async () => {
      try {
        const hasNewData = await callback();
        // Reset interval if new data found
        setInterval(hasNewData ? baseInterval : Math.min(interval * 1.5, 300000));
      } catch (error) {
        // Increase interval on error
        setInterval(prev => Math.min(prev * 2, 300000));
      }
      
      timeoutId = setTimeout(poll, interval);
    };
    
    poll();
    
    return () => clearTimeout(timeoutId);
  }, [callback, interval]);
};
```

## 🔧 Performance Issues

### 16. Large Dataset Loading
**Problem:**
```javascript
// Loading all scholarships at once
const scholarships = await Scholarship.findAll(); // Could be thousands
```

**Fix:**
```javascript
// Implement proper pagination
const getScholarships = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Scholarship.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });
  
  return {
    scholarships: rows,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(count / limit),
      total_items: count
    }
  };
};
```

### 17. Unnecessary Re-renders
**Problem:**
```javascript
// Component re-renders on every state change
const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  
  // Both cause re-render even if user only needs one
};
```

**Fix:**
```javascript
// Memoize expensive calculations
const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  
  const eligibleScholarships = useMemo(() => {
    return scholarships.filter(s => s.is_eligible);
  }, [scholarships]);
  
  const pendingApplications = useMemo(() => {
    return applications.filter(a => a.status === 'pending');
  }, [applications]);
  
  return (
    <div>
      <ScholarshipList scholarships={eligibleScholarships} />
      <ApplicationList applications={pendingApplications} />
    </div>
  );
};
```

## 🛠️ Debugging Tools & Techniques

### 18. API Request Logging
```javascript
// Add request/response logging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url, request.data);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('Request Error:', error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);
```

### 19. Database Query Monitoring
```javascript
// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  sequelize.addHook('beforeQuery', (options) => {
    console.time(`Query: ${options.sql.substring(0, 50)}...`);
  });
  
  sequelize.addHook('afterQuery', (options) => {
    console.timeEnd(`Query: ${options.sql.substring(0, 50)}...`);
  });
}
```

### 20. Error Boundary for React
```javascript
// Catch and handle React errors gracefully
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

These fixes address the most common integration issues and provide robust solutions for a production-ready scholarship management system.
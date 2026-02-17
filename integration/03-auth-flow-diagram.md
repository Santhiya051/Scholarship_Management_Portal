# Authentication Flow Diagram & Integration

## 🔐 Complete Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
│   (React)       │    │   (Express)     │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. POST /auth/login   │                       │
         │ { email, password }   │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Find user by email │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 3. User + Role data   │
         │                       │◄──────────────────────┤
         │                       │                       │
         │                       │ 4. Validate password  │
         │                       │    (bcrypt.compare)   │
         │                       │                       │
         │                       │ 5. Generate JWT tokens│
         │                       │    - Access Token     │
         │                       │    - Refresh Token    │
         │                       │                       │
         │ 6. Login Response     │                       │
         │ { user, tokens }      │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 7. Store tokens       │                       │
         │    localStorage       │                       │
         │                       │                       │
         │ 8. Set Auth Context   │                       │
         │    setUser(userData)  │                       │
         │                       │                       │
         │ 9. Redirect to        │                       │
         │    Dashboard          │                       │
```

## 🔄 Token Refresh Flow

```
┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │
└─────────────────┘    └─────────────────┘
         │                       │
         │ 1. API Request with   │
         │    expired token      │
         ├──────────────────────►│
         │                       │ 2. Token validation
         │                       │    fails (expired)
         │                       │
         │ 3. 401 Unauthorized   │
         │◄──────────────────────┤
         │                       │
         │ 4. Intercept 401      │
         │    Auto refresh       │
         │                       │
         │ 5. POST /auth/refresh │
         │ { refresh_token }     │
         ├──────────────────────►│
         │                       │ 6. Validate refresh
         │                       │    token & generate
         │                       │    new access token
         │                       │
         │ 7. New tokens         │
         │◄──────────────────────┤
         │                       │
         │ 8. Retry original     │
         │    request with new   │
         │    token              │
         ├──────────────────────►│
         │                       │
         │ 9. Success response   │
         │◄──────────────────────┤
```

## 🛡️ Role-Based Access Control Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
│   Route Guard   │    │   Middleware    │    │   Role Check    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Navigate to        │                       │
         │    /admin/users       │                       │
         │                       │                       │
         │ 2. Check user role    │                       │
         │    in context         │                       │
         │                       │                       │
         │ 3. Role: 'student'    │                       │
         │    Required: 'admin'  │                       │
         │                       │                       │
         │ 4. Redirect to        │                       │
         │    /unauthorized      │                       │
         │                       │                       │
         │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │                       │
         │                       │                       │
         │ 5. API Request        │                       │
         │    GET /users         │                       │
         ├──────────────────────►│                       │
         │                       │ 6. authenticateToken  │
         │                       │    middleware         │
         │                       │                       │
         │                       │ 7. requireRole(['admin'])
         │                       │    middleware         │
         │                       │                       │
         │                       │ 8. Get user + role    │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 9. User role data     │
         │                       │◄──────────────────────┤
         │                       │                       │
         │                       │ 10. Check role        │
         │                       │     'student' ∉ ['admin']
         │                       │                       │
         │ 11. 403 Forbidden     │                       │
         │◄──────────────────────┤                       │
```

## 🔧 Frontend Auth Implementation

### AuthContext Provider
```javascript
// src/context/AuthContext.jsx
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto-login on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.verifyToken(token)
        .then(user => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.tokens.access_token);
      localStorage.setItem('refreshToken', response.tokens.refresh_token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Route Component
```javascript
// src/components/common/ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role?.name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

### Axios Interceptors
```javascript
// src/services/authService.js
// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh-token', {
          refresh_token: refreshToken
        });
        
        const { access_token } = response.data.tokens;
        localStorage.setItem('token', access_token);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🔒 Backend Auth Implementation

### JWT Middleware
```javascript
// backend/src/middlewares/auth.js
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

### Role-Based Middleware
```javascript
// backend/src/middlewares/auth.js
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role.name;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

## 🗄️ Database Role Structure

### Roles Table
```sql
-- Default roles with permissions
INSERT INTO roles (name, display_name, permissions) VALUES
('student', 'Student', '["apply_scholarship", "view_own_applications", "upload_documents"]'),
('coordinator', 'Department Coordinator', '["manage_scholarships", "review_applications", "view_department_data"]'),
('committee', 'Scholarship Committee', '["review_applications", "score_applications", "view_all_applications"]'),
('finance', 'Finance Officer', '["process_payments", "view_financial_reports", "manage_disbursements"]'),
('admin', 'Administrator', '["*"]');
```

### User-Role Relationship
```sql
-- Users table with role reference
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES roles(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  -- ... other fields
);
```

## 🔄 Session Management

### Token Lifecycle
1. **Login**: Generate access token (24h) + refresh token (7d)
2. **API Requests**: Include access token in Authorization header
3. **Token Expiry**: Auto-refresh using refresh token
4. **Logout**: Clear tokens from localStorage
5. **Security**: Tokens are httpOnly in production (recommended)

### Security Best Practices
- **JWT Secret**: Strong, environment-specific secrets
- **Token Expiry**: Short-lived access tokens (15-60 minutes)
- **Refresh Rotation**: Rotate refresh tokens on use
- **Rate Limiting**: Limit login attempts
- **Account Lockout**: Lock accounts after failed attempts
- **Audit Logging**: Log all authentication events
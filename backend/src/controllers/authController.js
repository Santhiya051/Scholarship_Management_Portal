const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role, Student, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Register new user (students only)
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      student_id,
      department,
      major,
      year_of_study,
      gpa
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ where: { student_id } });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    // Get student role
    const studentRole = await Role.findOne({ where: { name: 'student' } });
    if (!studentRole) {
      return res.status(500).json({
        success: false,
        message: 'Student role not found in system'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone,
      role_id: studentRole.id
    });

    // Create student profile
    await Student.create({
      user_id: user.id,
      student_id,
      department,
      major,
      year_of_study,
      gpa: gpa || null,
      enrollment_date: new Date()
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Log registration
    await AuditLog.logCreate(user.id, 'user', user.id, { email, role: 'student' });

    // Get user with role for response
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role'
      }],
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userWithRole,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date() < user.locked_until) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      // Increment login attempts
      const attempts = (user.login_attempts || 0) + 1;
      const updateData = { login_attempts: attempts };
      
      // Lock account after 5 failed attempts
      if (attempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.update(updateData);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Reset login attempts and update last login
    await user.update({
      login_attempts: 0,
      locked_until: null,
      last_login: new Date()
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Log login
    await AuditLog.logLogin(user.id, {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    
    // Verify user still exists and is active
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'role'
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      data: {
        tokens: {
          access_token: accessToken,
          refresh_token: newRefreshToken
        }
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Log logout
    await AuditLog.logLogout(req.user.id, {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: 'role'
        },
        {
          model: Student,
          as: 'student'
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, gpa } = req.body;
    
    const oldValues = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      phone: req.user.phone
    };

    // Update user
    await req.user.update({
      first_name: first_name || req.user.first_name,
      last_name: last_name || req.user.last_name,
      phone: phone || req.user.phone
    });

    // Update student GPA if provided and user is a student
    if (gpa !== undefined && req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (student) {
        await student.update({ gpa });
      }
    }

    // Log update
    await AuditLog.logUpdate(req.user.id, 'user', req.user.id, oldValues, req.body);

    // Get updated user
    const updatedUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: 'role'
        },
        {
          model: Student,
          as: 'student'
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Verify current password
    const isValidPassword = await req.user.validatePassword(current_password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await req.user.update({ password: new_password });

    // Log password change
    await AuditLog.logAction(req.user.id, 'CHANGE_PASSWORD', 'user', req.user.id);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Verify token (for frontend to check if token is still valid)
const verifyToken = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
};
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const database = require('../database/connection');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('university').optional().trim(),
  validateRequest
], async (req, res) => {
  try {
    const { email, password, name, university } = req.body;

    // Check if user already exists
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await database.run(
      `INSERT INTO users (id, email, password, name, university, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, email, hashedPassword, name, university]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get created user (without password) - include all profile fields
    const user = await database.get(
      'SELECT id, email, name, university, major, year, bio, avatar, location, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await database.get(
      'SELECT id, email, name, university, major, year, bio, avatar, location, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching profile' 
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('university').optional().trim(),
  body('major').optional().trim(),
  body('year').optional().trim(),
  body('bio').optional().trim(),
  body('location').optional().trim(),
  validateRequest
], async (req, res) => {
  try {
    const { name, university, major, year, bio, location } = req.body;
    const userId = req.user.userId;

    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (university !== undefined) {
      updates.push('university = ?');
      params.push(university);
    }
    if (major !== undefined) {
      updates.push('major = ?');
      params.push(major);
    }
    if (year !== undefined) {
      updates.push('year = ?');
      params.push(year);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    await database.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated user
    const updatedUser = await database.get(
      'SELECT id, email, name, university, major, year, bio, avatar, location, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating profile' 
    });
  }
});

// Upload avatar
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const avatarPath = `/uploads/${req.file.filename}`;

    // Update user's avatar in database
    await database.run(
      'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avatarPath, userId]
    );

    // Get updated user
    const updatedUser = await database.get(
      'SELECT id, email, name, university, major, year, bio, avatar, location, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: avatarPath,
      user: updatedUser
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error while uploading avatar' 
    });
  }
});

// Change password
router.put('/change-password', verifyToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  validateRequest
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get current user
    const user = await database.get(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await database.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Internal server error while changing password' 
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', verifyToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, just return success (client removes token)
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user data
    const user = await database.get(
      'SELECT id, email, name FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      error: 'Internal server error while refreshing token' 
    });
  }
});

module.exports = { router, verifyToken };

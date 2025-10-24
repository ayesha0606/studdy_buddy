const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/connection');
const { verifyToken } = require('./auth');

const router = express.Router();

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

// Search users by criteria - MUST come before /:userId route
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { 
      major, 
      year, 
      subject, 
      location, 
      availableNow,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    const userId = req.user.userId;
    let whereConditions = ['u.id != ?'];
    let params = [userId];

    if (major) {
      whereConditions.push('u.major = ?');
      params.push(major);
    }

    if (year) {
      whereConditions.push('u.year = ?');
      params.push(year);
    }

    if (subject) {
      whereConditions.push('us.subject = ?');
      params.push(subject);
    }

    if (location) {
      whereConditions.push('u.location LIKE ?');
      params.push(`%${location}%`);
    }

    if (search) {
      whereConditions.push('(u.name LIKE ? OR u.major LIKE ? OR u.university LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Build query
    let query = `
      SELECT DISTINCT 
        u.id, u.name, u.university, u.major, u.year, u.bio, u.avatar, u.location,
        u.created_at,
        GROUP_CONCAT(DISTINCT us.subject) as subjects
      FROM users u
      LEFT JOIN user_subjects us ON u.id = us.user_id
    `;

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    const users = await database.all(query, params);

    // Format subjects
    const formattedUsers = users.map(user => ({
      ...user,
      subjects: user.subjects ? user.subjects.split(',') : []
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedUsers.length
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      error: 'Internal server error while searching users' 
    });
  }
});

// Get user statistics
router.get('/me/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total study sessions
    const sessionCount = await database.get(`
      SELECT COUNT(*) as count
      FROM session_participants 
      WHERE user_id = ?
    `, [userId]);

    // Get average rating
    const avgRating = await database.get(`
      SELECT AVG(rating) as average
      FROM session_ratings 
      WHERE rated_user_id = ?
    `, [userId]);

    // Get total matches
    const matchCount = await database.get(`
      SELECT COUNT(*) as count
      FROM matches 
      WHERE (user1_id = ? OR user2_id = ?) AND status = 'confirmed'
    `, [userId, userId]);

    // Get total conversations
    const conversationCount = await database.get(`
      SELECT COUNT(*) as count
      FROM conversations 
      WHERE user1_id = ? OR user2_id = ?
    `, [userId, userId]);

    // Get total likes received
    const likeCount = await database.get(`
      SELECT COUNT(*) as count
      FROM user_likes 
      WHERE liked_user_id = ?
    `, [userId]);

    res.json({
      stats: {
        totalSessions: sessionCount.count || 0,
        averageRating: avgRating.average ? parseFloat(avgRating.average).toFixed(1) : 0,
        totalMatches: matchCount.count || 0,
        totalConversations: conversationCount.count || 0,
        totalLikes: likeCount.count || 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching statistics' 
    });
  }
});

// Get user profile by ID (public profile)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await database.get(`
      SELECT id, name, university, major, year, bio, avatar, location, created_at
      FROM users WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user subjects
    const subjects = await database.all(`
      SELECT subject, proficiency_level
      FROM user_subjects 
      WHERE user_id = ?
    `, [userId]);

    // Get user study times
    const studyTimes = await database.all(`
      SELECT day_of_week, start_time, end_time
      FROM user_study_times 
      WHERE user_id = ?
      ORDER BY 
        CASE day_of_week 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          WHEN 'Sunday' THEN 7 
        END
    `, [userId]);

    res.json({
      user: {
        ...user,
        subjects,
        studyTimes
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching user profile' 
    });
  }
});

// Get current user's full profile
router.get('/me/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await database.get(`
      SELECT id, email, name, university, major, year, bio, avatar, location, 
             latitude, longitude, study_preferences, created_at, updated_at
      FROM users WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user subjects
    const subjects = await database.all(`
      SELECT id, subject, proficiency_level
      FROM user_subjects 
      WHERE user_id = ?
    `, [userId]);

    console.log('User ID:', userId);
    console.log('Subjects found:', subjects);

    // Get user study times
    const studyTimes = await database.all(`
      SELECT id, day_of_week, start_time, end_time
      FROM user_study_times 
      WHERE user_id = ?
      ORDER BY 
        CASE day_of_week 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          WHEN 'Sunday' THEN 7 
        END
    `, [userId]);

    console.log('Study times found:', studyTimes);

    // Get user preferences
    const preferences = await database.all(`
      SELECT preference_key, preference_value
      FROM user_preferences 
      WHERE user_id = ?
    `, [userId]);

    res.json({
      user: {
        ...user,
        subjects,
        studyTimes,
        preferences: preferences.reduce((acc, pref) => {
          acc[pref.preference_key] = pref.preference_value;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching profile' 
    });
  }
});

// Update current user's basic information
router.put('/me', verifyToken, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('university').optional().trim().isLength({ min: 1, max: 200 }),
  body('major').optional().trim().isLength({ min: 1, max: 100 }),
  body('year').optional().isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ min: 1, max: 200 }),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, university, major, year, bio, location } = req.body;

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (university !== undefined) {
      updateFields.push('university = ?');
      updateValues.push(university);
    }
    if (major !== undefined) {
      updateFields.push('major = ?');
      updateValues.push(major);
    }
    if (year !== undefined) {
      updateFields.push('year = ?');
      updateValues.push(year);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await database.run(updateQuery, updateValues);

    // Get updated user data
    const updatedUser = await database.get(`
      SELECT id, email, name, university, major, year, bio, avatar, location, 
             created_at, updated_at
      FROM users WHERE id = ?
    `, [userId]);

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

// Update user subjects
router.put('/me/subjects', verifyToken, [
  body('subjects').isArray(),
  body('subjects.*.subject').trim().notEmpty(),
  body('subjects.*.proficiency_level').isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  validateRequest
], async (req, res) => {
  try {
    const { subjects } = req.body;
    const userId = req.user.userId;

    // Delete existing subjects
    await database.run(
      'DELETE FROM user_subjects WHERE user_id = ?',
      [userId]
    );

    // Insert new subjects
    for (const subjectData of subjects) {
      await database.run(
        'INSERT INTO user_subjects (user_id, subject, proficiency_level) VALUES (?, ?, ?)',
        [userId, subjectData.subject, subjectData.proficiency_level]
      );
    }

    // Get updated subjects
    const updatedSubjects = await database.all(`
      SELECT id, subject, proficiency_level
      FROM user_subjects 
      WHERE user_id = ?
    `, [userId]);

    res.json({
      message: 'Subjects updated successfully',
      subjects: updatedSubjects
    });

  } catch (error) {
    console.error('Update subjects error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating subjects' 
    });
  }
});

// Update user study times
router.put('/me/study-times', verifyToken, [
  body('studyTimes').isArray(),
  body('studyTimes.*.day_of_week').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  body('studyTimes.*.start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('studyTimes.*.end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  validateRequest
], async (req, res) => {
  try {
    const { studyTimes } = req.body;
    const userId = req.user.userId;

    // Delete existing study times
    await database.run(
      'DELETE FROM user_study_times WHERE user_id = ?',
      [userId]
    );

    // Insert new study times
    for (const timeData of studyTimes) {
      await database.run(
        'INSERT INTO user_study_times (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [userId, timeData.day_of_week, timeData.start_time, timeData.end_time]
      );
    }

    // Get updated study times
    const updatedStudyTimes = await database.all(`
      SELECT id, day_of_week, start_time, end_time
      FROM user_study_times 
      WHERE user_id = ?
      ORDER BY 
        CASE day_of_week 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          WHEN 'Sunday' THEN 7 
        END
    `, [userId]);

    res.json({
      message: 'Study times updated successfully',
      studyTimes: updatedStudyTimes
    });

  } catch (error) {
    console.error('Update study times error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating study times' 
    });
  }
});

// Update user preferences
router.put('/me/preferences', verifyToken, [
  body('preferences').isObject(),
  validateRequest
], async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.userId;

    // Update each preference
    for (const [key, value] of Object.entries(preferences)) {
      await database.run(`
        INSERT OR REPLACE INTO user_preferences (user_id, preference_key, preference_value)
        VALUES (?, ?, ?)
      `, [userId, key, value]);
    }

    // Get updated preferences
    const updatedPreferences = await database.all(`
      SELECT preference_key, preference_value
      FROM user_preferences 
      WHERE user_id = ?
    `, [userId]);

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences.reduce((acc, pref) => {
        acc[pref.preference_key] = pref.preference_value;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating preferences' 
    });
  }
});

// Upload avatar
router.post('/me/avatar', verifyToken, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const userId = req.user.userId;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    // Update avatar
    await database.run(
      'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avatarUrl, userId]
    );

    res.json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating avatar' 
    });
  }
});

// Like a user's profile
router.post('/:userId/like', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const likerId = req.user.userId;

    console.log('Like request:', { userId, likerId });

    if (likerId === userId) {
      return res.status(400).json({ error: 'Cannot like your own profile' });
    }

    // Check if already liked
    const existingLike = await database.get(`
      SELECT * FROM user_likes WHERE liker_id = ? AND liked_user_id = ?
    `, [likerId, userId]);

    console.log('Existing like check:', existingLike);

    if (existingLike) {
      return res.status(400).json({ error: 'Already liked this user' });
    }

    // Add like
    const likeId = require('uuid').v4();
    console.log('Generated like ID:', likeId);
    
    const result = await database.run(`
      INSERT INTO user_likes (id, liker_id, liked_user_id)
      VALUES (?, ?, ?)
    `, [likeId, likerId, userId]);

    console.log('Like insert result:', result);

    res.json({ message: 'Profile liked successfully' });

  } catch (error) {
    console.error('Like user error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error while liking user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Unlike a user's profile
router.delete('/:userId/like', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const likerId = req.user.userId;

    console.log('Unlike request:', { userId, likerId });

    // Remove like
    const result = await database.run(`
      DELETE FROM user_likes WHERE liker_id = ? AND liked_user_id = ?
    `, [likerId, userId]);

    console.log('Unlike delete result:', result);

    res.json({ message: 'Like removed successfully' });

  } catch (error) {
    console.error('Unlike user error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error while removing like',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get like count for a user
router.get('/:userId/likes', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Get like count request:', { userId });

    const likeCount = await database.get(`
      SELECT COUNT(*) as count FROM user_likes WHERE liked_user_id = ?
    `, [userId]);

    console.log('Like count result:', likeCount);

    res.json({ likeCount: likeCount.count || 0 });

  } catch (error) {
    console.error('Get like count error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error while fetching like count',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if current user has liked a specific user
router.get('/:userId/liked', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    console.log('Check like status request:', { userId, currentUserId });

    const like = await database.get(`
      SELECT * FROM user_likes WHERE liker_id = ? AND liked_user_id = ?
    `, [currentUserId, userId]);

    console.log('Like status check result:', like);

    res.json({ hasLiked: !!like });

  } catch (error) {
    console.error('Check like status error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error while checking like status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = { router };

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

// Create a new study session
router.post('/sessions', verifyToken, [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('subject').optional().trim(),
  body('sessionType').isIn(['in-person', 'virtual']),
  body('location').custom((value, { req }) => {
    if (req.body.sessionType === 'in-person' && (!value || !value.trim())) {
      throw new Error('Location is required for in-person sessions');
    }
    return true;
  }),
  body('virtualLink').optional().custom((value) => {
    if (value && value.trim()) {
      try {
        new URL(value);
      } catch (error) {
        throw new Error('Virtual link must be a valid URL');
      }
    }
    return true;
  }),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('maxParticipants').optional().isInt({ min: 2, max: 10 }),
  validateRequest
], async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      sessionType,
      location,
      virtualLink,
      startTime,
      endTime,
      maxParticipants = 2
    } = req.body;

    const userId = req.user.userId;

    // Validate time logic
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({ error: 'Start time must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check for time conflicts with existing sessions
    const conflictingSessions = await database.all(`
      SELECT * FROM study_sessions 
      WHERE created_by = ? 
        AND status = 'scheduled'
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `, [userId, startTime, startTime, endTime, endTime, startTime, endTime]);

    if (conflictingSessions.length > 0) {
      return res.status(400).json({ 
        error: 'You have conflicting study sessions at this time' 
      });
    }

    // Create session
    const sessionId = require('uuid').v4();
    await database.run(`
      INSERT INTO study_sessions (
        id, title, description, subject, session_type, location, virtual_link,
        start_time, end_time, max_participants, created_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', CURRENT_TIMESTAMP)
    `, [
      sessionId, title, description, subject, sessionType, location, virtualLink,
      startTime, endTime, maxParticipants, userId
    ]);

    // Add creator as participant
    await database.run(`
      INSERT INTO session_participants (session_id, user_id, status, joined_at)
      VALUES (?, ?, 'confirmed', CURRENT_TIMESTAMP)
    `, [sessionId, userId]);

    // Get created session
    const session = await database.get(`
      SELECT * FROM study_sessions WHERE id = ?
    `, [sessionId]);

    res.status(201).json({
      message: 'Study session created successfully',
      session
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating study session' 
    });
  }
});

// Get all study sessions for current user
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, type } = req.query;

    let whereConditions = ['(s.created_by = ? OR sp.user_id = ?)'];
    let params = [userId, userId];

    if (status) {
      whereConditions.push('s.status = ?');
      params.push(status);
    }

    if (type) {
      whereConditions.push('s.session_type = ?');
      params.push(type);
    }

    const sessions = await database.all(`
      SELECT DISTINCT
        s.*,
        u.name as creator_name, u.avatar as creator_avatar,
        sp.status as participation_status
      FROM study_sessions s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN session_participants sp ON s.id = sp.session_id AND sp.user_id = ?
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY s.start_time ASC
    `, [userId, ...params]);

    // Get participant count for each session
    const sessionsWithParticipants = await Promise.all(
      sessions.map(async (session) => {
        const participantCount = await database.get(`
          SELECT COUNT(*) as count
          FROM session_participants 
          WHERE session_id = ? AND status = 'confirmed'
        `, [session.id]);

        return {
          ...session,
          participantCount: participantCount.count || 0
        };
      })
    );

    res.json({
      sessions: sessionsWithParticipants
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching study sessions' 
    });
  }
});

// Get a specific study session
router.get('/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Get session details
    const session = await database.get(`
      SELECT s.*, u.name as creator_name, u.avatar as creator_avatar
      FROM study_sessions s
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [sessionId]);

    if (!session) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    // Get participants
    const participants = await database.all(`
      SELECT 
        sp.user_id, sp.status, sp.joined_at,
        u.name, u.avatar, u.major, u.year, u.university
      FROM session_participants sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.session_id = ?
      ORDER BY sp.joined_at ASC
    `, [sessionId]);

    // Check if current user is participant
    const currentUserParticipation = participants.find(p => p.user_id === userId);

    res.json({
      session: {
        ...session,
        participants,
        currentUserParticipation
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching study session' 
    });
  }
});

// Update a study session
router.put('/sessions/:sessionId', verifyToken, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('subject').optional().trim(),
  body('sessionType').optional().isIn(['in-person', 'virtual']),
  body('location').optional().trim(),
  body('virtualLink').optional().isURL(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('maxParticipants').optional().isInt({ min: 2, max: 10 }),
  validateRequest
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    // Check if user is the creator
    const session = await database.get(`
      SELECT * FROM study_sessions WHERE id = ? AND created_by = ?
    `, [sessionId, userId]);

    if (!session) {
      return res.status(404).json({ 
        error: 'Study session not found or you are not the creator' 
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ 
        error: 'Cannot update a session that is not scheduled' 
      });
    }

    // Build update query
    const updateFields = [];
    const params = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      params.push(updates.title);
    }

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      params.push(updates.description);
    }

    if (updates.subject !== undefined) {
      updateFields.push('subject = ?');
      params.push(updates.subject);
    }

    if (updates.sessionType !== undefined) {
      updateFields.push('session_type = ?');
      params.push(updates.sessionType);
    }

    if (updates.location !== undefined) {
      updateFields.push('location = ?');
      params.push(updates.location);
    }

    if (updates.virtualLink !== undefined) {
      updateFields.push('virtual_link = ?');
      params.push(updates.virtualLink);
    }

    if (updates.startTime !== undefined) {
      updateFields.push('start_time = ?');
      params.push(updates.startTime);
    }

    if (updates.endTime !== undefined) {
      updateFields.push('end_time = ?');
      params.push(updates.endTime);
    }

    if (updates.maxParticipants !== undefined) {
      updateFields.push('max_participants = ?');
      params.push(updates.maxParticipants);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(sessionId);

    await database.run(`
      UPDATE study_sessions SET ${updateFields.join(', ')} WHERE id = ?
    `, params);

    // Get updated session
    const updatedSession = await database.get(`
      SELECT * FROM study_sessions WHERE id = ?
    `, [sessionId]);

    res.json({
      message: 'Study session updated successfully',
      session: updatedSession
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating study session' 
    });
  }
});

// Join a study session
router.post('/sessions/:sessionId/join', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Check if session exists and is open
    const session = await database.get(`
      SELECT * FROM study_sessions WHERE id = ? AND status = 'scheduled'
    `, [sessionId]);

    if (!session) {
      return res.status(404).json({ 
        error: 'Study session not found or not open for joining' 
      });
    }

    // Check if user is already a participant
    const existingParticipation = await database.get(`
      SELECT * FROM session_participants WHERE session_id = ? AND user_id = ?
    `, [sessionId, userId]);

    if (existingParticipation) {
      return res.status(400).json({ 
        error: 'You are already a participant in this session' 
      });
    }

    // Check if session is full
    const participantCount = await database.get(`
      SELECT COUNT(*) as count
      FROM session_participants 
      WHERE session_id = ? AND status = 'confirmed'
    `, [sessionId]);

    if (participantCount.count >= session.max_participants) {
      return res.status(400).json({ 
        error: 'Study session is full' 
      });
    }

    // Check for time conflicts
    const conflictingSessions = await database.all(`
      SELECT s.* FROM study_sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE sp.user_id = ? 
        AND s.status = 'scheduled'
        AND (
          (s.start_time <= ? AND s.end_time > ?) OR
          (s.start_time < ? AND s.end_time >= ?) OR
          (s.start_time >= ? AND s.end_time <= ?)
        )
    `, [userId, session.start_time, session.start_time, session.end_time, session.end_time, session.start_time, session.end_time]);

    if (conflictingSessions.length > 0) {
      return res.status(400).json({ 
        error: 'You have conflicting study sessions at this time' 
      });
    }

    // Join session
    await database.run(`
      INSERT INTO session_participants (session_id, user_id, status, joined_at)
      VALUES (?, ?, 'confirmed', CURRENT_TIMESTAMP)
    `, [sessionId, userId]);

    res.json({
      message: 'Successfully joined study session'
    });

  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while joining study session' 
    });
  }
});

// Leave a study session
router.post('/sessions/:sessionId/leave', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Check if user is a participant
    const participation = await database.get(`
      SELECT * FROM session_participants WHERE session_id = ? AND user_id = ?
    `, [sessionId, userId]);

    if (!participation) {
      return res.status(400).json({ 
        error: 'You are not a participant in this session' 
      });
    }

    // Check if user is the creator
    const session = await database.get(`
      SELECT * FROM study_sessions WHERE id = ? AND created_by = ?
    `, [sessionId, userId]);

    if (session) {
      return res.status(400).json({ 
        error: 'Session creator cannot leave. Cancel the session instead.' 
      });
    }

    // Leave session
    await database.run(`
      DELETE FROM session_participants WHERE session_id = ? AND user_id = ?
    `, [sessionId, userId]);

    res.json({
      message: 'Successfully left study session'
    });

  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while leaving study session' 
    });
  }
});

// Cancel a study session
router.post('/sessions/:sessionId/cancel', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Check if user is the creator
    const session = await database.get(`
      SELECT * FROM study_sessions WHERE id = ? AND created_by = ?
    `, [sessionId, userId]);

    if (!session) {
      return res.status(404).json({ 
        error: 'Study session not found or you are not the creator' 
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ 
        error: 'Cannot cancel a session that is not scheduled' 
      });
    }

    // Cancel session
    await database.run(`
      UPDATE study_sessions SET status = 'cancelled' WHERE id = ?
    `, [sessionId]);

    res.json({
      message: 'Study session cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while cancelling study session' 
    });
  }
});

// Rate a study session
router.post('/sessions/:sessionId/rate', verifyToken, [
  body('ratedUserId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim(),
  validateRequest
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { ratedUserId, rating, feedback } = req.body;
    const userId = req.user.userId;

    // Check if user participated in the session
    const participation = await database.get(`
      SELECT * FROM session_participants WHERE session_id = ? AND user_id = ?
    `, [sessionId, userId]);

    if (!participation) {
      return res.status(400).json({ 
        error: 'You must participate in a session to rate it' 
      });
    }

    // Check if session is completed
    const session = await database.get(`
      SELECT * FROM study_sessions WHERE id = ? AND status = 'completed'
    `, [sessionId]);

    if (!session) {
      return res.status(400).json({ 
        error: 'Can only rate completed sessions' 
      });
    }

    // Check if already rated
    const existingRating = await database.get(`
      SELECT * FROM session_ratings 
      WHERE session_id = ? AND rater_id = ? AND rated_user_id = ?
    `, [sessionId, userId, ratedUserId]);

    if (existingRating) {
      return res.status(400).json({ 
        error: 'You have already rated this user for this session' 
      });
    }

    // Create rating
    await database.run(`
      INSERT INTO session_ratings (
        session_id, rater_id, rated_user_id, rating, feedback, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [sessionId, userId, ratedUserId, rating, feedback]);

    res.json({
      message: 'Rating submitted successfully'
    });

  } catch (error) {
    console.error('Rate session error:', error);
    res.status(500).json({ 
      error: 'Internal server error while rating session' 
    });
  }
});

// Get session statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total sessions created
    const totalCreated = await database.get(`
      SELECT COUNT(*) as count FROM study_sessions WHERE created_by = ?
    `, [userId]);

    // Total sessions participated
    const totalParticipated = await database.get(`
      SELECT COUNT(*) as count FROM session_participants WHERE user_id = ?
    `, [userId]);

    // Upcoming sessions
    const upcomingSessions = await database.get(`
      SELECT COUNT(*) as count FROM study_sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE sp.user_id = ? AND s.status = 'scheduled' AND s.start_time > CURRENT_TIMESTAMP
    `, [userId]);

    // Average rating received
    const avgRating = await database.get(`
      SELECT AVG(rating) as average FROM session_ratings WHERE rated_user_id = ?
    `, [userId]);

    res.json({
      stats: {
        totalCreated: totalCreated.count || 0,
        totalParticipated: totalParticipated.count || 0,
        upcomingSessions: upcomingSessions.count || 0,
        averageRating: avgRating.average ? parseFloat(avgRating.average).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Get schedule stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching schedule statistics' 
    });
  }
});

module.exports = { router };

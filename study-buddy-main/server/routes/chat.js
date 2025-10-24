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

// Get all conversations for current user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await database.all(`
      SELECT 
        c.id, c.created_at, c.last_message_at,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        u.name, u.avatar, u.major, u.year, u.university
      FROM conversations c
      JOIN users u ON (
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END = u.id
      )
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.last_message_at DESC
    `, [userId, userId, userId, userId]);

    // Get last message and unread count for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await database.get(`
          SELECT content, sender_id, created_at, message_type
          FROM messages 
          WHERE conversation_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `, [conversation.id]);

        const unreadCount = await database.get(`
          SELECT COUNT(*) as count
          FROM messages 
          WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL
        `, [conversation.id, userId]);

        return {
          ...conversation,
          lastMessage: lastMessage || null,
          unreadCount: unreadCount.count || 0
        };
      })
    );

    res.json({
      conversations: conversationsWithMessages
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching conversations' 
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    const conversation = await database.get(`
      SELECT * FROM conversations 
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `, [conversationId, userId, userId]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages
    const messages = await database.all(`
      SELECT 
        m.id, m.content, m.sender_id, m.message_type, m.file_url, m.created_at, m.read_at,
        u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read
    await database.run(`
      UPDATE messages 
      SET read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL
    `, [conversationId, userId]);

    res.json({
      messages: messages.map(msg => ({
        ...msg,
        isMe: msg.sender_id === userId
      }))
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching messages' 
    });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', verifyToken, [
  body('content').trim().notEmpty(),
  body('messageType').optional().isIn(['text', 'file', 'image']),
  body('fileUrl').optional().isURL(),
  validateRequest
], async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', fileUrl } = req.body;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    const conversation = await database.get(`
      SELECT * FROM conversations 
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `, [conversationId, userId, userId]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const messageId = require('uuid').v4();
    await database.run(`
      INSERT INTO messages (id, conversation_id, sender_id, content, message_type, file_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [messageId, conversationId, userId, content, messageType, fileUrl]);

    // Update conversation last message time
    await database.run(`
      UPDATE conversations 
      SET last_message_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [conversationId]);

    // Get the created message with sender info
    const message = await database.get(`
      SELECT 
        m.id, m.content, m.sender_id, m.message_type, m.file_url, m.created_at,
        u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [messageId]);

    res.status(201).json({
      message: 'Message sent successfully',
      message: {
        ...message,
        isMe: true
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      error: 'Internal server error while sending message' 
    });
  }
});

// Create a new conversation (for direct messaging)
router.post('/conversations', verifyToken, [
  body('otherUserId').notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.userId;

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    const existingConversation = await database.get(`
      SELECT * FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, [userId, otherUserId, otherUserId, userId]);

    if (existingConversation) {
      return res.status(409).json({ 
        error: 'Conversation already exists',
        conversationId: existingConversation.id
      });
    }

    // Create new conversation
    const conversationId = require('uuid').v4();
    await database.run(`
      INSERT INTO conversations (id, user1_id, user2_id, created_at, last_message_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [conversationId, userId, otherUserId]);

    // Get other user info
    const otherUser = await database.get(`
      SELECT id, name, avatar, major, year, university
      FROM users WHERE id = ?
    `, [otherUserId]);

    res.status(201).json({
      message: 'Conversation created successfully',
      conversation: {
        id: conversationId,
        otherUser
      }
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating conversation' 
    });
  }
});

// Delete a conversation
router.delete('/conversations/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    const conversation = await database.get(`
      SELECT * FROM conversations 
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `, [conversationId, userId, userId]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete conversation (messages will be deleted due to CASCADE)
    await database.run(`
      DELETE FROM conversations WHERE id = ?
    `, [conversationId]);

    res.json({
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ 
      error: 'Internal server error while deleting conversation' 
    });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    const conversation = await database.get(`
      SELECT * FROM conversations 
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `, [conversationId, userId, userId]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all unread messages as read
    await database.run(`
      UPDATE messages 
      SET read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL
    `, [conversationId, userId]);

    res.json({
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ 
      error: 'Internal server error while marking messages as read' 
    });
  }
});

// Get unread message count for all conversations
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await database.get(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user1_id = ? OR c.user2_id = ?) 
        AND m.sender_id != ? 
        AND m.read_at IS NULL
    `, [userId, userId, userId]);

    res.json({
      unreadCount: unreadCount.count || 0
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching unread count' 
    });
  }
});

// Search messages in conversations
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { query, conversationId } = req.query;
    const userId = req.user.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    let sql = `
      SELECT 
        m.id, m.content, m.sender_id, m.message_type, m.file_url, m.created_at,
        c.id as conversation_id,
        u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON m.sender_id = u.id
      WHERE (c.user1_id = ? OR c.user2_id = ?) 
        AND m.content LIKE ?
    `;

    let params = [userId, userId, `%${query}%`];

    if (conversationId) {
      sql += ' AND c.id = ?';
      params.push(conversationId);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT 50';

    const searchResults = await database.all(sql, params);

    res.json({
      results: searchResults.map(msg => ({
        ...msg,
        isMe: msg.sender_id === userId
      }))
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ 
      error: 'Internal server error while searching messages' 
    });
  }
});

// Get conversation statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total conversations
    const totalConversations = await database.get(`
      SELECT COUNT(*) as count
      FROM conversations 
      WHERE user1_id = ? OR user2_id = ?
    `, [userId, userId]);

    // Total messages sent
    const totalMessagesSent = await database.get(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user1_id = ? OR c.user2_id = ?) AND m.sender_id = ?
    `, [userId, userId, userId]);

    // Total messages received
    const totalMessagesReceived = await database.get(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user1_id = ? OR c.user2_id = ?) AND m.sender_id != ?
    `, [userId, userId, userId]);

    // Unread messages
    const unreadMessages = await database.get(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user1_id = ? OR c.user2_id = ?) 
        AND m.sender_id != ? 
        AND m.read_at IS NULL
    `, [userId, userId, userId]);

    res.json({
      stats: {
        totalConversations: totalConversations.count || 0,
        totalMessagesSent: totalMessagesSent.count || 0,
        totalMessagesReceived: totalMessagesReceived.count || 0,
        unreadMessages: unreadMessages.count || 0
      }
    });

  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching chat statistics' 
    });
  }
});

module.exports = { router };

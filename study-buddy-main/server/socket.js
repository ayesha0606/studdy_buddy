const jwt = require('jsonwebtoken');
const database = require('./database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Store connected users
const connectedUsers = new Map();

// Middleware to authenticate socket connections
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userName = decoded.name;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize Socket.IO
const initializeSocket = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.userId})`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      name: socket.userName,
      connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Get user's conversations and join those rooms
    try {
      const conversations = await database.all(`
        SELECT id FROM conversations 
        WHERE user1_id = ? OR user2_id = ?
      `, [socket.userId, socket.userId]);

      conversations.forEach(conversation => {
        socket.join(`conversation:${conversation.id}`);
      });
    } catch (error) {
      console.error('Error joining conversation rooms:', error);
    }

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', fileUrl } = data;
        
        // Verify user is part of this conversation
        const conversation = await database.get(`
          SELECT * FROM conversations 
          WHERE id = ? AND (user1_id = ? OR user2_id = ?)
        `, [conversationId, socket.userId, socket.userId]);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create message in database
        const messageId = require('uuid').v4();
        await database.run(`
          INSERT INTO messages (id, conversation_id, sender_id, content, message_type, file_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [messageId, conversationId, socket.userId, content, messageType, fileUrl]);

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

        // Emit message to conversation room
        const messageData = {
          ...message,
          isMe: false
        };

        // Send to other users in the conversation
        socket.to(`conversation:${conversationId}`).emit('new_message', messageData);
        
        // Send confirmation to sender
        socket.emit('message_sent', {
          ...message,
          isMe: true
        });

        // Send notification to other user
        const otherUserId = conversation.user1_id === socket.userId ? conversation.user2_id : conversation.user1_id;
        const otherUser = connectedUsers.get(otherUserId);
        
        if (otherUser) {
          io.to(`user:${otherUserId}`).emit('message_notification', {
            conversationId,
            message: messageData,
            sender: {
              id: socket.userId,
              name: socket.userName
            }
          });
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', async (data) => {
      const { conversationId } = data;
      
      // Verify user is part of this conversation
      const conversation = await database.get(`
        SELECT * FROM conversations 
        WHERE id = ? AND (user1_id = ? OR user2_id = ?)
      `, [conversationId, socket.userId, socket.userId]);

      if (conversation) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName
        });
      }
    });

    socket.on('typing_stop', async (data) => {
      const { conversationId } = data;
      
      const conversation = await database.get(`
        SELECT * FROM conversations 
        WHERE id = ? AND (user1_id = ? OR user2_id = ?)
      `, [conversationId, socket.userId, socket.userId]);

      if (conversation) {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle read receipts
    socket.on('mark_read', async (data) => {
      const { conversationId } = data;
      
      try {
        // Mark messages as read in database
        await database.run(`
          UPDATE messages 
          SET read_at = CURRENT_TIMESTAMP
          WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL
        `, [conversationId, socket.userId]);

        // Notify other users in conversation
        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          userId: socket.userId,
          conversationId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle online status
    socket.on('set_status', (data) => {
      const { status } = data;
      const user = connectedUsers.get(socket.userId);
      
      if (user) {
        user.status = status;
        user.lastStatusUpdate = new Date();
        
        // Broadcast status change to all connected users
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status,
          name: socket.userName
        });
      }
    });

    // Handle join conversation room
    socket.on('join_conversation', (data) => {
      const { conversationId } = data;
      socket.join(`conversation:${conversationId}`);
      console.log(`👥 User ${socket.userName} joined conversation: ${conversationId}`);
    });

    // Handle leave conversation room
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      console.log(`👋 User ${socket.userName} left conversation: ${conversationId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userName} (${socket.userId})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        name: socket.userName
      });
    });
  });

  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log('🔄 Shutting down Socket.IO server...');
    io.close(() => {
      console.log('✅ Socket.IO server closed');
      process.exit(0);
    });
  });

  return io;
};

// Utility functions
const getConnectedUsers = () => {
  return Array.from(connectedUsers.entries()).map(([userId, userData]) => ({
    userId,
    ...userData
  }));
};

const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

const sendNotificationToUser = (userId, event, data) => {
  const user = connectedUsers.get(userId);
  if (user) {
    // This would need to be called from the main io instance
    // For now, we'll return the user's socket ID
    return user.socketId;
  }
  return null;
};

module.exports = {
  initializeSocket,
  getConnectedUsers,
  isUserOnline,
  sendNotificationToUser
};

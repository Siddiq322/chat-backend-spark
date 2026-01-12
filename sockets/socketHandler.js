/**
 * Socket.IO Event Handlers
 * Manages real-time communication between clients
 * 
 * EVENTS HANDLED:
 * - connection: Client connects with JWT authentication
 * - send_message: Send real-time message
 * - typing: User is typing
 * - stop_typing: User stopped typing
 * - message_delivered: Mark message as delivered
 * - message_read: Mark message as read
 * - disconnect: Client disconnects
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { verifyToken } = require('../utils/token');

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

/**
 * Initialize Socket.IO handlers
 */
const initializeSocket = (io) => {
  // Middleware: Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = user;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: ${userId} (Socket: ${socket.id})`);

    // Store user's socket ID
    connectedUsers.set(userId, socket.id);

    // Update user status to online
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
    });

    // Notify all connected users that this user is online
    socket.broadcast.emit('user_online', {
      userId,
      isOnline: true,
    });

    // Join user's personal room for private messages
    socket.join(userId);

    /**
     * SEND MESSAGE EVENT
     * Client sends: { receiverId, type, content, conversationId (optional) }
     */
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, type, content, conversationId, metadata } = data;
        const senderId = userId;

        console.log('📨 Message received:', { senderId, receiverId, type });

        // Validate required fields
        if (!receiverId || !type || !content) {
          socket.emit('message_error', {
            error: 'Missing required fields',
          });
          return;
        }

        // Find or create conversation
        let conversation;
        
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
        } else {
          // Find existing conversation or create new one
          conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!conversation) {
            conversation = await Conversation.create({
              participants: [senderId, receiverId],
            });
          }
        }

        // Create message
        const message = await Message.create({
          conversationId: conversation._id,
          sender: senderId,
          receiver: receiverId,
          type,
          content,
          status: 'sent',
          metadata: metadata || {},
        });

        // Populate sender info
        await message.populate('sender', 'username profilePicture');

        // Update conversation's last message
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        
        // Increment unread count for receiver
        const currentUnread = conversation.unreadCount.get(receiverId) || 0;
        conversation.unreadCount.set(receiverId, currentUnread + 1);
        
        await conversation.save();

        // Check if receiver is online
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
          // Receiver is online - send message immediately
          io.to(receiverSocketId).emit('receive_message', {
            message,
            conversationId: conversation._id,
          });

          // Auto-update status to delivered since receiver is online
          message.status = 'delivered';
          await message.save();
        }

        // Send confirmation to sender
        socket.emit('message_sent', {
          message,
          conversationId: conversation._id,
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', {
          error: 'Failed to send message',
        });
      }
    });

    /**
     * TYPING EVENT
     * Client sends: { receiverId, conversationId }
     */
    socket.on('typing', (data) => {
      try {
        const { receiverId, conversationId } = data;
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', {
            userId,
            conversationId,
            isTyping: true,
          });
        }
      } catch (error) {
        console.error('Typing event error:', error);
      }
    });

    /**
     * STOP TYPING EVENT
     * Client sends: { receiverId, conversationId }
     */
    socket.on('stop_typing', (data) => {
      try {
        const { receiverId, conversationId } = data;
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', {
            userId,
            conversationId,
            isTyping: false,
          });
        }
      } catch (error) {
        console.error('Stop typing event error:', error);
      }
    });

    /**
     * MESSAGE DELIVERED EVENT
     * Client sends: { messageId }
     */
    socket.on('message_delivered', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findByIdAndUpdate(
          messageId,
          { status: 'delivered' },
          { new: true }
        );

        if (message) {
          const senderSocketId = connectedUsers.get(message.sender.toString());
          
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_status_updated', {
              messageId,
              status: 'delivered',
            });
          }
        }
      } catch (error) {
        console.error('Message delivered error:', error);
      }
    });

    /**
     * MESSAGE READ EVENT
     * Client sends: { messageId } or { conversationId }
     */
    socket.on('message_read', async (data) => {
      try {
        const { messageId, conversationId } = data;

        if (messageId) {
          // Mark single message as read
          const message = await Message.findByIdAndUpdate(
            messageId,
            { status: 'read' },
            { new: true }
          );

          if (message) {
            const senderSocketId = connectedUsers.get(message.sender.toString());
            
            if (senderSocketId) {
              io.to(senderSocketId).emit('message_status_updated', {
                messageId,
                status: 'read',
              });
            }
          }
        } else if (conversationId) {
          // Mark all messages in conversation as read
          await Message.updateMany(
            {
              conversationId,
              receiver: userId,
              status: { $in: ['sent', 'delivered'] },
            },
            { status: 'read' }
          );

          // Notify sender(s)
          const messages = await Message.find({
            conversationId,
            receiver: userId,
          });

          messages.forEach((msg) => {
            const senderSocketId = connectedUsers.get(msg.sender.toString());
            if (senderSocketId) {
              io.to(senderSocketId).emit('messages_read', {
                conversationId,
                readBy: userId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    /**
     * REQUEST SENT EVENT (for real-time chat request notifications)
     * Client sends: { receiverId, request }
     */
    socket.on('request_sent', (data) => {
      try {
        const { receiverId, request } = data;
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('request_received', {
            request,
          });
        }
      } catch (error) {
        console.error('Request sent error:', error);
      }
    });

    /**
     * REQUEST ACCEPTED EVENT
     * Client sends: { senderId }
     */
    socket.on('request_accepted', (data) => {
      try {
        const { senderId, conversation } = data;
        const senderSocketId = connectedUsers.get(senderId);

        if (senderSocketId) {
          io.to(senderSocketId).emit('request_accepted_notification', {
            conversation,
            acceptedBy: userId,
          });
        }
      } catch (error) {
        console.error('Request accepted error:', error);
      }
    });

    /**
     * DISCONNECT EVENT
     */
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${userId}`);

      // Remove from connected users
      connectedUsers.delete(userId);

      // Update user status to offline
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });

      // Notify all users that this user is offline
      socket.broadcast.emit('user_offline', {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    });
  });

  console.log('🚀 Socket.IO initialized');
};

module.exports = { initializeSocket, connectedUsers };

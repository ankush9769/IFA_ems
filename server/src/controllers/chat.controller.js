import createHttpError from 'http-errors';
import Chat from '../models/Chat.js';

/**
 * Get or create a chat for a client
 */
export const getOrCreateChat = async (req, res, next) => {
  try {
    console.log('Chat request from user:', req.user);
    
    const userId = req.user.sub;
    const userRole = req.user.role;

    if (!userId || !userRole) {
      throw createHttpError(401, 'Invalid authentication token');
    }

    let chat;

    if (userRole === 'client') {
      // Client accessing their own chat
      chat = await Chat.findOne({ client: userId })
        .populate('client', 'name email')
        .populate('messages.sender', 'name role');

      if (!chat) {
        // Create new chat for client
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId);
        
        if (!user) {
          throw createHttpError(404, 'User not found');
        }
        
        chat = await Chat.create({
          client: userId,
          clientName: user.name,
          messages: [],
        });
        chat = await Chat.findById(chat._id)
          .populate('client', 'name email')
          .populate('messages.sender', 'name role');
      }
    } else if (userRole === 'admin') {
      // Admin accessing a specific client's chat
      const clientId = req.params.clientId || req.query.clientId;
      
      if (!clientId) {
        throw createHttpError(400, 'Client ID required for admin');
      }

      chat = await Chat.findOne({ client: clientId })
        .populate('client', 'name email')
        .populate('messages.sender', 'name role');

      if (!chat) {
        const client = await (await import('../models/User.js')).default.findById(clientId);
        if (!client) {
          throw createHttpError(404, 'Client not found');
        }
        chat = await Chat.create({
          client: clientId,
          clientName: client.name,
          messages: [],
        });
        chat = await Chat.findById(chat._id)
          .populate('client', 'name email')
          .populate('messages.sender', 'name role');
      }
    } else {
      throw createHttpError(403, 'Only clients and admins can access chat');
    }

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all chats (admin only)
 */
export const getAllChats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw createHttpError(403, 'Admin access required');
    }

    const chats = await Chat.find()
      .populate('client', 'name email')
      .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, clientId } = req.body;
    const userId = req.user.sub;
    const userRole = req.user.role;

    if (!message || !message.trim()) {
      throw createHttpError(400, 'Message is required');
    }

    let chat;

    if (userRole === 'client') {
      // Client sending message
      chat = await Chat.findOne({ client: userId });
      
      if (!chat) {
        const user = await (await import('../models/User.js')).default.findById(userId);
        chat = await Chat.create({
          client: userId,
          clientName: user.name,
          messages: [],
        });
      }
    } else if (userRole === 'admin') {
      // Admin sending message to a client
      if (!clientId) {
        throw createHttpError(400, 'Client ID required');
      }

      chat = await Chat.findOne({ client: clientId });
      
      if (!chat) {
        const client = await (await import('../models/User.js')).default.findById(clientId);
        if (!client) {
          throw createHttpError(404, 'Client not found');
        }
        chat = await Chat.create({
          client: clientId,
          clientName: client.name,
          messages: [],
        });
      }
    } else {
      throw createHttpError(403, 'Only clients and admins can send messages');
    }

    // Add message
    chat.messages.push({
      sender: userId,
      senderRole: userRole,
      message: message.trim(),
      read: false,
    });

    chat.lastMessage = message.trim();
    chat.lastMessageAt = new Date();

    // Increment unread count for the recipient
    if (userRole === 'client') {
      // Client sent message, admin hasn't read it
      chat.unreadCount = (chat.unreadCount || 0) + 1;
    }

    await chat.save();

    // Populate and return
    chat = await Chat.findById(chat._id)
      .populate('client', 'name email')
      .populate('messages.sender', 'name role');

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const { clientId } = req.params;

    let chat;

    if (userRole === 'client') {
      chat = await Chat.findOne({ client: userId });
    } else if (userRole === 'admin') {
      chat = await Chat.findOne({ client: clientId });
    } else {
      throw createHttpError(403, 'Access denied');
    }

    if (!chat) {
      throw createHttpError(404, 'Chat not found');
    }

    // Mark unread messages as read
    let updated = false;
    chat.messages.forEach((msg) => {
      if (!msg.read && String(msg.sender) !== userId) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) {
      if (userRole === 'admin') {
        chat.unreadCount = 0;
      }
      await chat.save();
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

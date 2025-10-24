import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Send, Paperclip, Smile, MessageSquare, Clock, Users, BookOpen, Lightbulb } from 'lucide-react';
import { chatAPI, matchesAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { staticChats, getChatById, getMessagesForChat, type ChatConversation, type ChatMessage } from '../data/staticChats';

interface ChatInterfaceProps {
  onBack: () => void;
  conversationId?: string;
  otherUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  currentUser?: any; // Add current user prop
}

// Static chat data that all users can see
const STATIC_CHATS = [
  {
    id: 'static-study-tips',
    name: 'Study Tips & Tricks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    major: 'General',
    year: 'All Levels',
    university: 'Study Buddy Community',
    description: 'Share and discover effective study strategies',
    isStatic: true,
    messages: [
      {
        id: '1',
        content: 'Welcome to Study Tips & Tricks! 🎓 Share your best study strategies here.',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read_at: null,
        isMe: false
      },
      {
        id: '2',
        content: 'Pro tip: Use the Pomodoro Technique - 25 minutes of focused study followed by a 5-minute break! ⏰',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read_at: null,
        isMe: false
      },
      {
        id: '3',
        content: 'Active recall is more effective than passive reading. Try explaining concepts to yourself or others! 🧠',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read_at: null,
        isMe: false
      }
    ]
  },
  {
    id: 'static-homework-help',
    name: 'Homework Help Desk',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    major: 'General',
    year: 'All Levels',
    university: 'Study Buddy Community',
    description: 'Get help with homework and assignments',
    isStatic: true,
    messages: [
      {
        id: '1',
        content: 'Welcome to Homework Help Desk! 📚 Need help with an assignment? Post your question here.',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read_at: null,
        isMe: false
      },
      {
        id: '2',
        content: 'Remember: Show your work and explain your thought process when asking for help! ✍️',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read_at: null,
        isMe: false
      },
      {
        id: '3',
        content: 'Don\'t forget to check the resources section for helpful study materials! 📖',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read_at: null,
        isMe: false
      }
    ]
  },
  {
    id: 'static-exam-prep',
    name: 'Exam Preparation Hub',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
    major: 'General',
    year: 'All Levels',
    university: 'Study Buddy Community',
    description: 'Prepare for exams together with study groups',
    isStatic: true,
    messages: [
      {
        id: '1',
        content: 'Welcome to Exam Preparation Hub! 📝 Let\'s ace those exams together!',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read_at: null,
        isMe: false
      },
      {
        id: '2',
        content: 'Create study groups, share resources, and quiz each other! 🎯',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read_at: null,
        isMe: false
      },
      {
        id: '3',
        content: 'Pro tip: Start studying early and review regularly instead of cramming the night before! ⚡',
        sender_id: 'system',
        sender_name: 'Study Buddy Bot',
        sender_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read_at: null,
        isMe: false
      }
    ]
  }
];

export function ChatInterface({ onBack, conversationId: initialConversationId, otherUser: initialOtherUser, currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [loadingPendingMatches, setLoadingPendingMatches] = useState(false);
  const [currentStaticChat, setCurrentStaticChat] = useState<any>(null);
  const [currentPersonalChat, setCurrentPersonalChat] = useState<ChatConversation | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [otherUser, setOtherUser] = useState<any>(initialOtherUser);
  const [selectedChat, setSelectedChat] = useState<any>(null); // New state for selected chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const newSocket = io('http://localhost:3001', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('receive_message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load conversations and pending matches on component mount
  useEffect(() => {
    loadConversations();
    loadPendingMatches();
  }, []);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.type === 'conversation' && selectedChat.id) {
        loadMessages();
      } else if (selectedChat.type === 'static') {
        setMessages(selectedChat.messages);
      } else if (selectedChat.type === 'personal') {
        setMessages(selectedChat.messages);
      }
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedChat || selectedChat.type !== 'conversation' || !selectedChat.id) return;
    
    setIsLoading(true);
    try {
      const response = await chatAPI.getMessages(selectedChat.id);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await chatAPI.getConversations();
      console.log('Loaded conversations:', response);
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadPendingMatches = async () => {
    setLoadingPendingMatches(true);
    try {
      const response = await matchesAPI.getPendingMatches();
      console.log('Loaded pending matches:', response);
      setPendingMatches(response.pendingMatches || []);
    } catch (error) {
      console.error('Error loading pending matches:', error);
    } finally {
      setLoadingPendingMatches(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const response = await matchesAPI.respondToMatch(matchId, 'accept');
      console.log('Match accepted:', response);
      
      // Refresh both lists
      await Promise.all([loadConversations(), loadPendingMatches()]);
      
      // Show success message
      alert('Match accepted! You can now start chatting.');
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('Failed to accept match. Please try again.');
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const response = await matchesAPI.respondToMatch(matchId, 'reject');
      console.log('Match rejected:', response);
      
      // Refresh pending matches
      await loadPendingMatches();
    } catch (error) {
      console.error('Error rejecting match:', error);
      alert('Failed to reject match. Please try again.');
    }
  };

  // Updated chat selection handlers
  const selectConversation = (conversation: any) => {
    console.log('🎯 Selected conversation:', conversation);
    setSelectedChat({
      type: 'conversation',
      id: conversation.id,
      name: conversation.name,
      avatar: conversation.avatar,
      otherUserId: conversation.other_user_id
    });
  };

  const selectStaticChat = (staticChat: any) => {
    console.log('🎯 Selected static chat:', staticChat.name);
    setSelectedChat({
      type: 'static',
      ...staticChat
    });
  };

  const selectPersonalChat = (personalChat: ChatConversation) => {
    console.log('🎯 Selected personal chat:', personalChat.participantName);
    setSelectedChat({
      type: 'personal',
      ...personalChat
    });
  };

  const sendMessageToStaticChat = () => {
    if (newMessage.trim() && selectedChat && selectedChat.type === 'static') {
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: currentUser?.id || 'anonymous',
        sender_name: currentUser?.name || 'Anonymous User',
        sender_avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
        message_type: 'text',
        created_at: new Date().toISOString(),
        read_at: null,
        isMe: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          content: `Thanks for your message! This is a community chat where everyone can participate. Keep the conversation going! 💬`,
          sender_id: 'system',
          sender_name: 'Study Buddy Bot',
          sender_avatar: selectedChat.avatar,
          message_type: 'text',
          created_at: new Date().toISOString(),
          read_at: null,
          isMe: false
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const sendMessageToPersonalChat = () => {
    if (newMessage.trim() && selectedChat && selectedChat.type === 'personal') {
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: currentUser?.id || 'current-user',
        sender_name: currentUser?.name || 'You',
        sender_avatar: currentUser?.avatar || '',
        message_type: 'text',
        created_at: new Date().toISOString(),
        read_at: null,
        isMe: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Simulate response from the other person after a short delay
      setTimeout(() => {
        const responses = [
          "That's a great point! I've been thinking about that too.",
          "Thanks for sharing! This is really helpful.",
          "I agree completely. What do you think about...",
          "Interesting perspective! Have you tried...",
          "That makes a lot of sense. Maybe we could..."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const otherPersonResponse = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender_id: selectedChat.participantId,
          sender_name: selectedChat.participantName,
          sender_avatar: selectedChat.participantAvatar || '👤',
          message_type: 'text',
          created_at: new Date().toISOString(),
          read_at: null,
          isMe: false
        };
        setMessages(prev => [...prev, otherPersonResponse]);
      }, 1500);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      if (selectedChat?.type === 'static') {
        // Handle static chat message
        sendMessageToStaticChat();
      } else if (selectedChat?.type === 'personal') {
        // Handle personal chat message
        sendMessageToPersonalChat();
      } else if (socket && isConnected && selectedChat?.type === 'conversation' && selectedChat.id) {
        // Handle regular conversation message
        socket.emit('send_message', {
          conversationId: selectedChat.id,
          content: newMessage
        });
        setNewMessage('');
      } else if (!isConnected) {
        console.warn('Socket not connected, cannot send message.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Helper functions for navigation (no longer used but kept for reference)
  const openPersonalChat = (personalChat: ChatConversation) => {
    setSelectedChat({ ...personalChat, type: 'personal' });
  };

  const openStaticChat = (staticChat: any) => {
    setSelectedChat({ ...staticChat, type: 'static' });
  };

  const openConversation = (conversation: any) => {
    setSelectedChat({ ...conversation, type: 'conversation' });
  };

  // WhatsApp-style layout: Always show split screen
  return (
    <div className="h-full flex bg-background">
      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              loadConversations();
              loadPendingMatches();
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Clock className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
          {/* Show all available chats */}
          <div className="space-y-2">
            {/* Personal Chats */}
            {staticChats.map((chat) => (
              <div
                key={`personal-${chat.id}`}
                onClick={() => setSelectedChat({ ...chat, type: 'personal' })}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedChat?.id === chat.id && selectedChat?.type === 'personal' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-800">
                      <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-lg font-semibold">
                        {chat.participantAvatar || '👤'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{chat.participantName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">Personal</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-500">{chat.lastMessageTime || 'Recently'}</span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Community Chats */}
            {STATIC_CHATS.map((chat) => (
              <div
                key={`static-${chat.id}`}
                onClick={() => setSelectedChat({ ...chat, type: 'static' })}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedChat?.id === chat.id && selectedChat?.type === 'static' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-800">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                        {chat.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Community indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{chat.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">Community</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{chat.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-500">{chat.major} • {chat.year}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{chat.messages?.length || 0} messages</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Conversation Chats */}
            {conversations.map((chat) => (
              <div
                key={`conv-${chat.id}`}
                onClick={() => setSelectedChat({ ...chat, type: 'conversation' })}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedChat?.id === chat.id && selectedChat?.type === 'conversation' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-800">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-sm font-semibold">
                        {chat.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Match indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{chat.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">Match</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {chat.lastMessage?.content || 'Start a conversation...'}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : 'New'}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {!selectedChat ? (
          /* No chat selected - Show placeholder */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Select a chat to start conversation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Choose a contact from the sidebar to view messages and start chatting</p>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  💬 Connect with study buddies, join community discussions, or chat with your matches!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat selected - Show chat interface */
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-gray-700">
                    <AvatarImage src={selectedChat.avatar || selectedChat.participantAvatar} />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold">
                      {(selectedChat.name || selectedChat.participantName)?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator based on chat type */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-900 rounded-full ${
                    selectedChat.type === 'static' ? 'bg-blue-500' :
                    selectedChat.type === 'personal' ? 'bg-green-500' :
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedChat.name || selectedChat.participantName}</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      selectedChat.type === 'static' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      selectedChat.type === 'personal' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                      {selectedChat.type === 'static' ? 'Community Chat' :
                       selectedChat.type === 'personal' ? 'Personal Chat' : 'Matched Chat'}
                    </span>
                    {selectedChat.type === 'conversation' && (
                      <span className={`text-xs flex items-center space-x-1 ${
                        isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span>{isConnected ? 'Online' : 'Offline'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Chat actions can be added here */}
                <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span>Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h4>
                  <p className="text-gray-600 dark:text-gray-400">Start the conversation! Be the first to send a message.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end space-x-2 ${message.isMe || message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Other person's avatar (left side) */}
                    {!(message.isMe || message.sender_id === currentUser?.id) && (
                      <Avatar className="w-8 h-8 mb-1">
                        <AvatarImage src={message.sender_avatar || selectedChat.avatar} />
                        <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {message.sender_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      message.isMe || message.sender_id === currentUser?.id
                        ? 'bg-blue-500 text-white rounded-br-md' 
                        : message.sender_id === 'system' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 rounded-bl-md'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.isMe || message.sender_id === currentUser?.id 
                            ? 'text-blue-100' 
                            : message.sender_id === 'system'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {/* Read status for sent messages */}
                        {(message.isMe || message.sender_id === currentUser?.id) && (
                          <div className="text-blue-200 text-xs">
                            {message.read_at ? '✓✓' : '✓'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Current user's avatar (right side) */}
                    {(message.isMe || message.sender_id === currentUser?.id) && (
                      <Avatar className="w-8 h-8 mb-1">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {currentUser?.name?.charAt(0) || 'Y'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="pr-12 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()} 
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
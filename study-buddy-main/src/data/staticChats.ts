export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

// Static chat data for all users
export const staticChats: ChatConversation[] = [
  {
    id: 'chat-1',
    participantId: 'user-1',
    participantName: 'Sarah Chen',
    participantAvatar: '👩‍💻',
    lastMessage: 'Thanks for the help with the algorithm!',
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-1-1',
        senderId: 'user-1',
        senderName: 'Sarah Chen',
        content: 'Hi! I saw you\'re studying algorithms too. Can you help me understand dynamic programming?',
        timestamp: '2024-01-15T10:00:00Z',
        isOwn: false
      },
      {
        id: 'msg-1-2',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Of course! Dynamic programming can be tricky at first. What specific problem are you working on?',
        timestamp: '2024-01-15T10:05:00Z',
        isOwn: true
      },
      {
        id: 'msg-1-3',
        senderId: 'user-1',
        senderName: 'Sarah Chen',
        content: 'I\'m trying to solve the Fibonacci sequence problem. I understand the recursive approach but not the DP version.',
        timestamp: '2024-01-15T10:10:00Z',
        isOwn: false
      },
      {
        id: 'msg-1-4',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Great question! The key is to store previously calculated values. Here\'s how you can approach it...',
        timestamp: '2024-01-15T10:15:00Z',
        isOwn: true
      },
      {
        id: 'msg-1-5',
        senderId: 'user-1',
        senderName: 'Sarah Chen',
        content: 'Thanks for the help with the algorithm!',
        timestamp: '2024-01-15T12:00:00Z',
        isOwn: false
      }
    ]
  },
  {
    id: 'chat-2',
    participantId: 'user-2',
    participantName: 'Alex Rodriguez',
    participantAvatar: '👨‍🎓',
    lastMessage: 'Let\'s schedule our next study session!',
    lastMessageTime: '1 day ago',
    unreadCount: 2,
    messages: [
      {
        id: 'msg-2-1',
        senderId: 'user-2',
        senderName: 'Alex Rodriguez',
        content: 'Hey! Are you free to study machine learning concepts this weekend?',
        timestamp: '2024-01-14T15:00:00Z',
        isOwn: false
      },
      {
        id: 'msg-2-2',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Hi Alex! Yes, I\'d love to. What specific topics do you want to cover?',
        timestamp: '2024-01-14T15:05:00Z',
        isOwn: true
      },
      {
        id: 'msg-2-3',
        senderId: 'user-2',
        senderName: 'Alex Rodriguez',
        content: 'I\'m struggling with neural network backpropagation. Maybe we can work through some examples together?',
        timestamp: '2024-01-14T15:10:00Z',
        isOwn: false
      },
      {
        id: 'msg-2-4',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Perfect! I have some great examples we can work through. How about Saturday at 2 PM?',
        timestamp: '2024-01-14T15:15:00Z',
        isOwn: true
      },
      {
        id: 'msg-2-5',
        senderId: 'user-2',
        senderName: 'Alex Rodriguez',
        content: 'That works great for me! Let\'s meet at the library. Looking forward to it!',
        timestamp: '2024-01-14T15:20:00Z',
        isOwn: false
      },
      {
        id: 'msg-2-6',
        senderId: 'user-2',
        senderName: 'Alex Rodriguez',
        content: 'Let\'s schedule our next study session!',
        timestamp: '2024-01-14T16:00:00Z',
        isOwn: false
      }
    ]
  }
];

// Get chats for a specific user (in this case, all users get the same static chats)
export const getChatsForUser = (userId: string): ChatConversation[] => {
  return staticChats;
};

// Get a specific chat by ID
export const getChatById = (chatId: string): ChatConversation | undefined => {
  return staticChats.find(chat => chat.id === chatId);
};

// Get messages for a specific chat
export const getMessagesForChat = (chatId: string): ChatMessage[] => {
  const chat = getChatById(chatId);
  return chat ? chat.messages : [];
};

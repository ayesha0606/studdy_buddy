import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Environment variable helper for Vite
const getApiKey = (): string => {
  // Vite exposes environment variables through import.meta.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ No Gemini API key found. Please ensure VITE_GEMINI_API_KEY is set in your .env file and restart the dev server.');
    return '';
  }
  
  return apiKey;
};

interface FloatingChatbotProps {
  user?: any;
}

export function FloatingChatbot({ user }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your StudyBuddy AI assistant. I can help you with study tips, academic questions, or finding the right study partners. How can I help you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Fallback responses for when API is unavailable
  const getFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('study') && (input.includes('tip') || input.includes('help'))) {
      return "Here are some effective study tips:\n\n1. **Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break\n2. **Active Recall**: Test yourself instead of just re-reading notes\n3. **Spaced Repetition**: Review material at increasing intervals\n4. **Find a Study Group**: Connect with classmates for collaborative learning\n\nWould you like more specific advice for your major or subjects?";
    }
    
    if (input.includes('time') && input.includes('manage')) {
      return "Great time management strategies for students:\n\n• **Use a planner** to track deadlines and assignments\n• **Prioritize tasks** using the Eisenhower Matrix\n• **Break large projects** into smaller, manageable chunks\n• **Set specific study hours** and stick to them\n• **Eliminate distractions** during study time\n\nConsistent scheduling is key to academic success!";
    }
    
    if (input.includes('partner') || input.includes('buddy') || input.includes('group')) {
      return "Finding the right study partners is crucial! Here's how:\n\n✅ **Look for classmates** who share similar goals\n✅ **Use StudyBuddy's matching** to find compatible partners\n✅ **Join study groups** in your major or specific subjects\n✅ **Attend office hours** to meet serious students\n✅ **Form online study sessions** for convenience\n\nGood study partners can improve your understanding and motivation!";
    }
    
    if (input.includes('stress') || input.includes('anxiety') || input.includes('mental')) {
      return "Managing academic stress is important for your well-being:\n\n🧘 **Practice mindfulness** and deep breathing\n💤 **Get adequate sleep** (7-9 hours nightly)\n🏃 **Exercise regularly** to reduce stress hormones\n👥 **Talk to friends** or counselors when overwhelmed\n📚 **Break tasks down** to make them less daunting\n\nRemember: It's okay to ask for help when you need it!";
    }
    
    if (input.includes('exam') || input.includes('test')) {
      return "Effective exam preparation strategies:\n\n📝 **Create a study schedule** 2-3 weeks before exams\n🔄 **Practice with past papers** and sample questions\n👥 **Form study groups** to discuss difficult concepts\n📚 **Use active learning** techniques like flashcards\n⏰ **Take regular breaks** to avoid burnout\n🌙 **Get good sleep** before the exam\n\nConsistent preparation beats last-minute cramming!";
    }
    
    if (input.includes('motivation') || input.includes('procrastination')) {
      return "Staying motivated and beating procrastination:\n\n🎯 **Set clear, achievable goals** for each study session\n🏆 **Reward yourself** after completing tasks\n📱 **Remove distractions** (phone, social media)\n⏰ **Use the 2-minute rule**: If it takes less than 2 minutes, do it now\n👥 **Study with accountability partners**\n🎵 **Create a productive study environment**\n\nRemember why you're studying - your future self will thank you!";
    }
    
    // Default responses
    const defaultResponses = [
      "I'm here to help with your studies! You can ask me about:\n\n• Study techniques and tips\n• Time management strategies\n• Finding study partners\n• Exam preparation\n• Managing academic stress\n• Motivation and productivity\n\nWhat specific area would you like help with?",
      "Great question! While I'd love to give you a personalized response, I'm currently having connectivity issues. Here are some general study tips that work for most students:\n\n1. Create a consistent study schedule\n2. Find a quiet, dedicated study space\n3. Use active learning techniques\n4. Take regular breaks\n5. Connect with study partners\n\nWhat specific subject or challenge are you working on?",
      "I'm your StudyBuddy AI assistant! Even though I'm having some connection issues right now, I can still help with:\n\n📚 Study strategies\n⏰ Time management\n👥 Finding study partners\n🎯 Goal setting\n💡 Learning techniques\n\nFeel free to ask about any of these topics!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Prevent sending the same message repeatedly
    if (inputMessage.trim() === lastMessage) {
      console.log('Duplicate message detected, skipping API call');
      return;
    }
    
    // Basic input sanitization
    const sanitizedInput = inputMessage.trim().slice(0, 1000); // Limit input length
    setLastMessage(sanitizedInput);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: sanitizedInput,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add a small delay to prevent rapid-fire requests
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const apiKey = getApiKey();
      
      // Debug logging (remove in production)
      console.log('API Key available:', apiKey ? 'Yes' : 'No');
      console.log('API Key length:', apiKey.length);
      
      // Check if API key is available
      if (!apiKey) {
        throw new Error('No API key available');
      }
      // Try Google Gemini API instead of OpenRouter
      let response;
      let apiError = null;
      
      // First try: Google Gemini API with correct model
      try {
        console.log('Connecting to Google Gemini API...');
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are StudyBuddy AI, a helpful assistant for students. You help with study tips, academic questions, finding study partners, time management, and student wellness. Keep responses concise, practical, and under 200 words.

User context: ${user ? `${user.name} at ${user.university || 'university'}, studying ${user.major || 'various subjects'}` : 'Student'}

User question: ${userMessage.content}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 200,
              stopSequences: [],
              candidateCount: 1
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: data.candidates[0].content.parts[0].text.trim(),
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
            return;
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          apiError = `Gemini API error ${response.status}: ${errorData.error?.message || response.statusText}`;
          console.warn('Gemini API Error:', apiError);
        }
      } catch (error) {
        apiError = `Gemini API connection failed: ${error}`;
        console.warn('Gemini Connection Error:', error);
      }
      
      // Second try: Alternative Gemini model
      if (apiError) {
        try {
          console.log('Trying alternative Gemini model...');
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `As StudyBuddy AI, help this student: ${userMessage.content}`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 150
              }
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.candidates[0].content.parts[0].text.trim(),
                role: 'assistant',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, assistantMessage]);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.warn('Alternative Gemini model also failed:', error);
        }
      }
      
      // If Gemini fails, use enhanced fallback (reduce console spam)
      if (apiError) {
        console.warn('⚠️ Gemini API unavailable. Using intelligent fallback responses.');
      }
    } catch (error) {
      console.log('API failed, using fallback response for:', userMessage.content);
      
      // Use fallback response instead of error message
      const fallbackResponse = getFallbackResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s ease',
            fontSize: '24px'
          }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
          }}
        >
          💬
          {/* Pulse Animation */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '16px',
              height: '16px',
              background: '#EF4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            maxWidth: '90vw',
            height: isMinimized ? 'auto' : '500px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              color: 'white',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src="/bot.jpg" 
                  alt="StudyBuddy AI" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }} 
                />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>StudyBuddy AI</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Always here to help</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                {isMinimized ? '□' : '−'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  maxHeight: '350px'
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      marginBottom: '16px',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: message.role === 'user' ? '#3B82F6' : '#F3F4F6',
                        color: message.role === 'user' ? 'white' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {message.role === 'user' ? (
                        <User style={{ width: '18px', height: '18px' }} />
                      ) : (
                        <img 
                          src="/bot.jpg" 
                          alt="Bot" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }} 
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: message.role === 'user' ? 'right' : 'left' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '12px 16px',
                          borderRadius: '18px',
                          background: message.role === 'user' ? '#3B82F6' : '#F3F4F6',
                          color: message.role === 'user' ? 'white' : '#1F2937',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          maxWidth: '85%',
                          wordWrap: 'break-word'
                        }}
                      >
                        {message.content}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          marginTop: '4px'
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#F3F4F6',
                        color: '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src="/bot.jpg" 
                        alt="Bot" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }} 
                      />
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        background: '#F3F4F6',
                        color: '#6B7280',
                        fontSize: '14px'
                      }}
                    >
                      <span>Thinking</span>
                      <span style={{ animation: 'blink 1.4s infinite' }}>...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: '16px',
                  borderTop: '1px solid #E5E7EB',
                  background: '#F9FAFB'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about studying..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '20px',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: inputMessage.trim() && !isLoading ? '#3B82F6' : '#D1D5DB',
                      border: 'none',
                      borderRadius: '20px',
                      color: 'white',
                      cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isLoading ? '⏳' : '📤'}
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    textAlign: 'center',
                    marginTop: '8px'
                  }}
                >
                  Powered by AI • Always here to help with your studies
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
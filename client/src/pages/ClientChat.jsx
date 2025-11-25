import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';
import api from '../utils/api.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ClientChat = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch my chat
  const { data: chat, isLoading } = useQuery({
    queryKey: ['my-chat', user?.id],
    queryFn: async () => {
      const res = await api.get('/chats/my-chat');
      return res.data;
    },
    enabled: !!user?.id,
    refetchInterval: isTyping ? false : 3000, // Don't refetch while typing
    refetchIntervalInBackground: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const res = await api.post('/chats/message', messageData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-chat'] });
      setMessage('');
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message: message.trim(),
    });
    setIsTyping(false); // Reset typing state after sending
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-12rem)]">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Chat with Admin</h1>

      <div className="bg-white rounded-lg shadow flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-sky-500 to-purple-600 text-white rounded-t-lg">
          <h2 className="text-lg font-semibold">Admin Support</h2>
          <p className="text-sm opacity-90">Get help with your projects</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {!chat || chat.messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation with the admin about your projects</p>
            </div>
          ) : (
            chat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.senderRole === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.senderRole === 'client'
                      ? 'bg-sky-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">
                      {msg.senderRole === 'client' ? 'You' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.senderRole === 'client' ? 'text-sky-100' : 'text-gray-400'
                    }`}
                  >
                    {dayjs(msg.createdAt).format('MMM D, h:mm A')}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={(e) => {
                // Delay to allow button click to register
                setTimeout(() => setIsTyping(false), 200);
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              type="submit"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur on button click
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientChat;

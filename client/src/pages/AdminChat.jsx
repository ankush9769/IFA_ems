import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';
import api from '../utils/api.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AdminChat = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all chats
  const { data: chatsData } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: async () => {
      const res = await api.get('/chats');
      return res.data;
    },
    refetchInterval: 5000, // Slower refresh for list
    refetchIntervalInBackground: false,
  });

  // Fetch selected chat
  const { data: selectedChat } = useQuery({
    queryKey: ['chat', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return null;
      const res = await api.get(`/chats/${selectedClient}`);
      return res.data;
    },
    enabled: !!selectedClient,
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
      queryClient.invalidateQueries({ queryKey: ['chat', selectedClient] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
      setMessage('');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (clientId) => {
      await api.put(`/chats/${clientId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Mark as read when opening chat
  useEffect(() => {
    if (selectedClient && selectedChat) {
      markAsReadMutation.mutate(selectedClient);
    }
  }, [selectedClient, selectedChat?.messages?.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedClient) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      clientId: selectedClient,
    });
    setIsTyping(false); // Reset typing state after sending
  };

  const chats = chatsData?.chats || [];

  return (
    <div className="w-full max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Chat Contacts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Clients List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-sky-500 to-purple-600 text-white">
            <h2 className="text-lg font-semibold">Clients</h2>
            <p className="text-sm opacity-90">{chats.length} conversations</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-5rem)]">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedClient(chat.client._id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedClient === chat.client._id ? 'bg-sky-50 border-l-4 border-l-sky-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{chat.clientName}</h3>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {chat.lastMessageAt && (
                    <p className="text-xs text-gray-400 mt-1">{dayjs(chat.lastMessageAt).fromNow()}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 bg-white rounded-lg shadow flex flex-col">
          {selectedClient && selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-sky-500 to-purple-600 text-white rounded-t-lg">
                <h2 className="text-lg font-semibold">{selectedChat.clientName}</h2>
                <p className="text-sm opacity-90">{selectedChat.client.email}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedChat.messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  selectedChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderRole === 'admin'
                            ? 'bg-sky-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderRole === 'admin' ? 'text-sky-100' : 'text-gray-400'
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
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
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
                <p className="text-lg">Select a client to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

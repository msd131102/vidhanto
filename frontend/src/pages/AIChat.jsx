import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Send, Bot, User, Clock, MessageSquare, Trash2, MoreVertical,
  Sparkles, AlertCircle, CheckCircle, X, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStats, setChatStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
      loadChatStats();
    }
  }, [isAuthenticated]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await aiAPI.getHistory({ limit: 10 });
      if (response.success) {
        setChatHistory(response.data.chats);
      }
    } catch (error) {
      utils.handleError(error, 'Failed to load chat history');
    }
  };

  const loadChatStats = async () => {
    try {
      const response = await aiAPI.getUsage();
      if (response.success) {
        setChatStats(response.data.usage);
      }
    } catch (error) {
      console.error('Failed to load chat stats:', error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await aiAPI.getChat(chatId);
      if (response.success) {
        setMessages(response.data.chat.messages || []);
        setCurrentChatId(chatId);
        setShowHistory(false);
      }
    } catch (error) {
      utils.handleError(error, 'Failed to load chat');
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: currentMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await aiAPI.chat(userMessage.content, currentChatId);
      
      if (response.success) {
        const aiMessage = {
          id: response.data.aiResponse.id,
          content: response.data.aiResponse.content,
          sender: 'ai',
          timestamp: response.data.aiResponse.createdAt,
          isAI: true,
          tokenUsage: response.data.aiResponse.tokenUsage
        };

        setMessages(prev => [...prev, aiMessage]);
        setCurrentChatId(response.data.chatId);
        
        // Update chat title if it's a new chat
        if (!currentChatId) {
          loadChatHistory();
        }
      }
    } catch (error) {
      utils.handleError(error, 'Failed to send message');
      
      // Remove the user message if AI failed to respond
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentMessage('');
    inputRef.current?.focus();
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    try {
      const response = await aiAPI.deleteChat(chatId);
      if (response.success) {
        setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
        if (currentChatId === chatId) {
          setMessages([]);
          setCurrentChatId(null);
        }
        toast.success('Chat deleted successfully');
      }
    } catch (error) {
      utils.handleError(error, 'Failed to delete chat');
    }
  };

  const rateChat = async (chatId, rating) => {
    try {
      const response = await aiAPI.updateChat(chatId, { rating });
      if (response.success) {
        setChatHistory(prev => 
          prev.map(chat => 
            chat._id === chatId 
              ? { ...chat, rating }
              : chat
          )
        );
        toast.success('Thank you for your feedback!');
      }
    } catch (error) {
      utils.handleError(error, 'Failed to rate chat');
    }
  };

  const endChat = async () => {
    if (!currentChatId) return;
    
    try {
      const response = await aiAPI.endChat(currentChatId);
      if (response.success) {
        setCurrentChatId(null);
        setMessages([]);
        loadChatHistory(); // Refresh history
        loadChatStats(); // Refresh stats
        toast.success('Chat session ended');
      }
    } catch (error) {
      utils.handleError(error, 'Failed to end chat');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTokenColor = (tokens) => {
    if (tokens < 100) return 'text-green-600';
    if (tokens < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
            <p className="text-slate-600 mb-6">Please log in to access the AI Legal Assistant.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar - Chat History */}
      <div className={`w-80 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat History
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={startNewChat}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {chatHistory.map((chat) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-3"
              >
                <div
                  onClick={() => loadChat(chat._id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    currentChatId === chat._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-900 truncate flex-1">{chat.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => rateChat(chat._id, 5, e)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        title="Rate as helpful"
                      >
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={(e) => deleteChat(chat._id, e)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                    {chat.rating && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-amber-500" />
                        <span>{chat.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Legal Assistant</h1>
                <p className="text-sm text-slate-600">Get instant legal guidance from our AI</p>
              </div>
            </div>
            
            {chatStats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Usage this month:</span>
                  <span className={`font-semibold ${getTokenColor(chatStats.totalTokens)}`}>
                    {chatStats.totalTokens} tokens
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Cost:</span>
                  <span className="font-semibold text-slate-900">₹{chatStats.totalCost}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 mb-4 ${
                    message.isAI ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isAI 
                      ? 'bg-blue-600' 
                      : 'bg-slate-600'
                  }`}>
                    {message.isAI ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-md px-4 py-3 rounded-2xl ${
                    message.isAI
                      ? 'bg-blue-50 text-slate-900 border border-blue-200'
                      : 'bg-slate-900 text-white border border-slate-700'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs opacity-60">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.isAI && message.tokenUsage && (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="opacity-60">Tokens:</span>
                          <span className={getTokenColor(message.tokenUsage.total)}>
                            {message.tokenUsage.total}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-4 justify-start"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-blue-50 text-slate-900 border border-blue-200 max-w-md px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your legal question..."
                className="flex-1 resize-none border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
                
                {currentChatId && (
                  <div className="flex gap-2">
                    <button
                      onClick={endChat}
                      className="bg-slate-600 text-white px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                    >
                      End Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>Legal Disclaimer:</strong> AI provides general legal information, not legal advice. Always consult with a qualified lawyer for specific legal matters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

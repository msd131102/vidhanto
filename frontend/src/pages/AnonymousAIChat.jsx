import React, { useState, useRef, useEffect } from 'react';
import { aiAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Send, Bot, User, Shield, AlertTriangle, Clock, MessageSquare,
  Sparkles, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnonymousAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    setMessageCount(prev => prev + 1);

    try {
      const response = await aiAPI.anonymousChat(userMessage.content);
      
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          content: response.data.aiResponse.content,
          sender: 'ai',
          timestamp: response.data.aiResponse.timestamp,
          isAI: true,
          model: response.data.aiResponse.model,
          anonymous: true
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      utils.handleError(error, 'Failed to send message');
      
      // Remove the user message if AI failed to respond
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setMessageCount(prev => prev - 1);
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

  const clearChat = () => {
    setMessages([]);
    setMessageCount(0);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sampleLegalQuestions = [
    "What is Section 420 IPC?",
    "Draft a legal notice for cheque bounce",
    "Explain divorce process in India",
    "What is FIR and how to file it?",
    "What are my rights as a consumer?",
    "How to file a case in consumer court?"
  ];

  const handleSampleQuestion = (question) => {
    setCurrentMessage(question);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">⚖️ Anonymous Legal AI Assistant</h1>
                <p className="text-sm text-slate-600">Get instant legal guidance - 100% anonymous</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Eye className="w-4 h-4" />
                <span>Anonymous Mode</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MessageSquare className="w-4 h-4" />
                <span>{messageCount} messages</span>
              </div>
              <button
                onClick={clearChat}
                className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-200 p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-amber-800">🔒 100% Anonymous Chat</strong>
                  <p className="text-sm text-amber-700 mt-1">
                    No registration required. No data stored. Your privacy is protected.
                  </p>
                </div>
                <button
                  onClick={() => setShowDisclaimer(!showDisclaimer)}
                  className="p-1 hover:bg-amber-100 rounded transition-colors"
                >
                  {showDisclaimer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Welcome to Anonymous Legal AI
                  </h2>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Ask any legal question about Indian laws. No registration, no tracking, complete privacy.
                  </p>
                </div>

                {/* Sample Questions */}
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Try these legal questions:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sampleLegalQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSampleQuestion(question)}
                        className="text-left p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-green-300 transition-all text-sm text-slate-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isAI 
                          ? 'bg-green-600' 
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
                          ? 'bg-green-50 text-slate-900 border border-green-200'
                          : 'bg-slate-900 text-white border border-slate-700'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs opacity-60">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          {message.isAI && (
                            <div className="flex items-center gap-1 text-xs">
                              <Shield className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">AI</span>
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
                    className="flex gap-3 justify-start"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-green-50 text-slate-900 border border-green-200 max-w-md px-4 py-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
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
                  placeholder="Ask your legal question... (e.g., What is Section 420 IPC?)"
                  className="flex-1 resize-none border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  disabled={isLoading}
                />
                
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 z-50"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>⚖️ Legal Disclaimer:</strong> This AI provides general legal information for educational purposes only, not legal advice. Always consult with a qualified lawyer for specific legal matters.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnonymousAIChat;

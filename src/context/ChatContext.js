import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useChat } from '../hooks/useChat';
import { useAuth } from './AuthContext';

const ChatContext = createContext({});

export const useGlobalChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useGlobalChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const chatState = useChat();
  const { isAuthenticated } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const hasStartedInitialLoad = useRef(false);

  const { fetchConversations, conversations, setActiveConversation } = chatState;

  // Load initial conversations only once when authenticated
  useEffect(() => {
    if (isAuthenticated && !initialLoadComplete && !hasStartedInitialLoad.current) {
      hasStartedInitialLoad.current = true;
      fetchConversations().then(() => {
        setInitialLoadComplete(true);
      });
    }
  }, [isAuthenticated, initialLoadComplete, fetchConversations]);

  // Handle active conversation change
  const handleSetActiveConversationId = useCallback((conversationId) => {
    if (conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
      // Find and set the active conversation object
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [activeConversationId, conversations, setActiveConversation]);

  const value = {
    ...chatState,
    isAuthenticated,
    initialLoadComplete,
    activeConversationId,
    setActiveConversationId: handleSetActiveConversationId
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ChatContext;

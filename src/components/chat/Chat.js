import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Offcanvas, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FiSearch, FiX, FiMessageSquare, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../../context/AuthContext';
import { useGlobalChat } from '../../context/ChatContext';
import { getProfileImageUrl } from '../../utils/imageUtils';

const Chat = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    conversations,
    messages,
    activeConversation,
    searchResults,
    searchQuery,
    error: chatError,
    loading,
    loadingMessages,
    handleSearch,
    startNewConversation,
    sendMessage,
    setActiveConversation,
    setSearchQuery,
    setSearchResults,
    setError: setChatError,
    fetchConversations,
    markMessagesAsRead,
    showChat,
    setShowChat,
    activeConversationId,
    setActiveConversationId
  } = useGlobalChat();

  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastMarkReadTime, setLastMarkReadTime] = useState(0);

  // Memoize error handler
  const handleError = useCallback((error) => {
    console.error('Chat error:', error);
    const errorMessage = error.message || 'An error occurred';
    setError(errorMessage);
    toast.error(errorMessage);
    
    if (errorMessage.includes('sign in') || errorMessage.includes('auth')) {
      setTimeout(() => {
        setShowChat(false);
        navigate('/login', { state: { from: window.location.pathname } });
      }, 2000);
    }
  }, [navigate, setShowChat]);

  // Memoize message sender
  const handleSendMessage = useCallback(async (content) => {
    if (!activeConversation || !content.trim()) {
      return;
    }

    if (!isAuthenticated) {
      handleError(new Error('Please sign in to send messages'));
      return;
    }

    try {
      await sendMessage(content, activeConversation.id);
    } catch (error) {
      handleError(error);
    }
  }, [activeConversation, isAuthenticated, sendMessage, handleError]);

  // Memoize conversation selector
  const handleSelectConversation = useCallback((conversation) => {
    if (conversation?.id !== activeConversation?.id) {
      setActiveConversation(conversation);
      setActiveConversationId(conversation ? conversation.id : null);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [activeConversation, setActiveConversation, setActiveConversationId, setSearchQuery, setSearchResults]);

  // Memoize other user getter
  const getOtherUser = useCallback((conversation) => {
    if (!conversation || !user) return null;
    return conversation.participant1_id === user.id 
      ? conversation.participant2
      : conversation.participant1;
  }, [user]);

  const otherUser = useMemo(() => 
    activeConversation ? getOtherUser(activeConversation) : null
  , [activeConversation, getOtherUser]);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const loadInitialData = async () => {
      if (showChat && isAuthenticated && user) {
        try {
          await fetchConversations();
          if (mounted) {
            setIsInitialLoad(false);
          }
        } catch (err) {
          console.error('Error loading initial data:', err);
          if (mounted) {
            setError('Failed to load conversations');
          }
        }
      } else if (showChat && !isAuthenticated) {
        setError('Please sign in to access chat features');
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showChat, isAuthenticated, user, fetchConversations]);

  useEffect(() => {
    let timeoutId;
    const now = Date.now();
    
    if (activeConversation && isAuthenticated && messages.length > 0 && 
        (now - lastMarkReadTime > 5000)) { // Only mark as read every 5 seconds
      timeoutId = setTimeout(() => {
        markMessagesAsRead(activeConversation.id);
        setLastMarkReadTime(now);
      }, 1000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [activeConversation, isAuthenticated, messages, markMessagesAsRead, lastMarkReadTime]);

  const handleBack = () => {
    setActiveConversation(null);
    setActiveConversationId(null);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = useCallback(() => {
    setShowChat(false);
    setActiveConversation(null);
    setActiveConversationId(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  }, [setShowChat, setActiveConversation, setActiveConversationId, setSearchQuery, setSearchResults]);

  const handleLogin = useCallback(() => {
    handleClose();
    navigate('/login', { state: { from: window.location.pathname } });
  }, [handleClose, navigate]);

  if (!isAuthenticated) {
    return (
      <Offcanvas show={showChat} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chat</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column justify-content-center align-items-center">
          <FiMessageSquare size={48} className="mb-3 text-muted" />
          <p className="text-center mb-4">Please sign in to access chat features</p>
          <Button variant="primary" onClick={handleLogin}>
            Sign In
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }

  return (
    <Offcanvas show={showChat} onHide={handleClose} placement="end" className="chat-offcanvas">
      <Offcanvas.Header closeButton>
        {activeConversation ? (
          <div className="d-flex align-items-center w-100">
            <Button
              variant="link"
              className="me-2 p-0 text-dark"
              onClick={handleBack}
            >
              <FiChevronLeft size={24} />
            </Button>

            {otherUser ? (
              <div className="d-flex align-items-center">
                <img
                  src={getProfileImageUrl(otherUser.profile_photo)}
                  alt={`${otherUser.firstname} ${otherUser.lastname}`}
                  className="rounded-circle me-2"
                  width="40"
                  height="40"
                  style={{ objectFit: 'cover' }}
                />
                <div>
                  <Offcanvas.Title className="mb-0">
                    {`${otherUser.firstname} ${otherUser.lastname}`}
                  </Offcanvas.Title>
                  {otherUser.email && (
                    <small className="text-muted">{otherUser.email}</small>
                  )}
                </div>
              </div>
            ) : (
              <Offcanvas.Title className="mb-0">Conversation</Offcanvas.Title>
            )}
          </div>
        ) : (
          <Offcanvas.Title>Messages</Offcanvas.Title>
        )}
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0 d-flex flex-column" style={{ height: '100vh' }}>
        {(error || chatError) && (
          <Alert variant="danger" onClose={() => {
            setError(null);
            setChatError(null);
          }} dismissible>
            {error || chatError}
          </Alert>
        )}
        
        {!activeConversation ? (
          <>
            <div className="p-3 border-bottom">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => setShowSearch(true)}
                />
                {searchQuery && (
                  <Button variant="outline-secondary" onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearch(false);
                  }}>
                    <FiX />
                  </Button>
                )}
              </InputGroup>
            </div>
            
            {showSearch && searchQuery ? (
              <div className="search-results">
                {loading ? (
                  <div className="p-3 text-center">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <div
                      key={user.profiles_id}
                      className="p-3 border-bottom d-flex align-items-center cursor-pointer hover-bg-light"
                      onClick={() => startNewConversation(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={getProfileImageUrl(user.profile_photo)}
                        alt={`${user.firstname} ${user.lastname}`}
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="fw-semibold">
                        {user.firstname} {user.lastname}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted">
                    No users found
                  </div>
                )}
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                currentUser={user}
                loading={loading || isInitialLoad}
              />
            )}
          </>
        ) : (
          <div className="d-flex flex-column h-100">
            <div className="flex-grow-1 overflow-auto">
              {loadingMessages ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <Spinner animation="border" />
                </div>
              ) : (
                <MessageList
                  key={activeConversation?.id}
                  messages={messages}
                  currentUser={user}
                  otherUser={otherUser}
                />
              )}
            </div>
            <div className="border-top">
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!activeConversation || loadingMessages}
              />
            </div>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Chat; 
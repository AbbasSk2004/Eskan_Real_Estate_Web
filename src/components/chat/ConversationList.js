import React, { useState } from 'react';
import { ListGroup, Spinner, Modal, Button } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useGlobalChat } from '../../context/ChatContext';
import { getProfileImageUrl } from '../../utils/imageUtils';

const ConversationList = ({ conversations = [], activeConversation, onSelectConversation, loading, currentUser }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const { deleteChatHistory } = useGlobalChat();

  const handleDeleteClick = (e, conversation) => {
    e.stopPropagation();
    setConversationToDelete(conversation);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (conversationToDelete) {
      try {
        await deleteChatHistory(conversationToDelete.id);
        setShowDeleteModal(false);
        setConversationToDelete(null);
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading conversations...</span>
        </Spinner>
      </div>
    );
  }

  if (!Array.isArray(conversations) || conversations.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center p-4 text-muted h-100">
        <FiMessageSquare size={48} className="mb-3 opacity-50" />
        <p className="mb-0">No conversations yet</p>
        <small>Search for users to start chatting</small>
      </div>
    );
  }

  return (
    <>
      <ListGroup variant="flush">
        {conversations.map(conversation => {
          if (!conversation) return null;

          const otherParticipant = conversation.participant1_id === currentUser?.id
            ? conversation.participant2
            : conversation.participant1;

          if (!otherParticipant) return null;

          // Determine the latest message for preview purposes.
          const lastMessage = Array.isArray(conversation.messages) && conversation.messages.length > 0
            ? conversation.messages[conversation.messages.length - 1]
            : (conversation.last_message || conversation.lastMessage || null);

          const unreadCount = Array.isArray(conversation.messages)
            ? conversation.messages.filter(msg => msg?.sender_id !== currentUser?.id && !msg?.read).length
            : (conversation.unread_count || 0);

          return (
            <ListGroup.Item
              key={conversation.id}
              action
              active={activeConversation?.id === conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className="border-0 border-bottom py-3 position-relative"
            >
              <div className="d-flex align-items-start">
                <div className="position-relative">
                  <img
                    src={getProfileImageUrl(otherParticipant?.profile_photo)}
                    alt={`${otherParticipant?.firstname || 'User'} ${otherParticipant?.lastname || ''}`}
                    className="rounded-circle"
                    width="40"
                    height="40"
                    style={{ objectFit: 'cover' }}
                  />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="ms-3 overflow-hidden flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0 text-truncate">
                      {`${otherParticipant?.firstname || 'User'} ${otherParticipant?.lastname || ''}`}
                    </h6>
                    <div className="d-flex align-items-center">
                      {lastMessage && (
                        <small className={`text-nowrap ms-2 ${activeConversation?.id === conversation.id ? 'text-white-50' : 'text-muted'}`}>
                          {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </small>
                      )}
                      <div
                        role="button"
                        className={`ms-2 p-0 ${activeConversation?.id === conversation.id ? 'text-white-50' : 'text-muted'}`}
                        onClick={(e) => handleDeleteClick(e, conversation)}
                        style={{ cursor: 'pointer' }}
                      >
                        <FiTrash2 size={16} />
                      </div>
                    </div>
                  </div>
                  <p 
                    className={`mb-0 text-truncate ${
                      activeConversation?.id === conversation.id 
                        ? 'text-white-50' 
                        : unreadCount > 0 
                          ? 'text-dark fw-semibold' 
                          : 'text-muted'
                    }`}
                    style={{ fontSize: '0.875rem' }}
                  >
                    {lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this conversation? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.array,
  activeConversation: PropTypes.object,
  onSelectConversation: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  currentUser: PropTypes.object
};

export default ConversationList; 
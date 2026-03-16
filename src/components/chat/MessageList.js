import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { getProfileImageUrl } from '../../utils/imageUtils';

const MessageList = ({ messages = [], currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to the bottom ONCE – when the component mounts – so that
  // the user is taken to the last message when a conversation is opened.
  // We deliberately avoid re-scrolling on subsequent message updates so
  // that the view remains wherever the user has scrolled.
  const initialScrollDoneRef = useRef(false);

  useEffect(() => {
    if (!initialScrollDoneRef.current && messages.length > 0) {
      scrollToBottom();
      initialScrollDoneRef.current = true;
    }
  }, [messages]);

  if (!Array.isArray(messages)) {
    return null;
  }

  return (
    <div className="messages-container p-3" style={{ overflowY: 'auto', height: '100%' }}>
      {messages.map((message) => {
        if (!message?.id || !message?.content) return null;

        const isSentByMe = message.sender_id === currentUser?.id;
        const sender = message.sender || {};

        return (
          <div
            key={message.id}
            className={`d-flex mb-3 ${isSentByMe ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div style={{ maxWidth: '75%' }}>
              {!isSentByMe && (
                <div className="d-flex align-items-center mb-1">
                  <img
                    src={getProfileImageUrl(sender?.profile_photo)}
                    alt={`${sender?.firstname || 'User'} ${sender?.lastname || ''}`}
                    className="rounded-circle"
                    width="24"
                    height="24"
                    style={{ objectFit: 'cover' }}
                  />
                  <small className="ms-2 text-muted">
                    {sender?.firstname || 'User'} {sender?.lastname || ''}
                  </small>
                </div>
              )}
              <div
                className={`message-bubble p-3 ${
                  isSentByMe
                    ? 'sent-message'
                    : 'received-message'
                }`}
                style={{
                  backgroundColor: isSentByMe ? '#0095f6' : '#f0f2f5',
                  color: isSentByMe ? '#fff' : '#000',
                  borderRadius: '18px',
                  maxWidth: '100%',
                  wordWrap: 'break-word'
                }}
              >
                <p className="mb-1" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {message.content}
                </p>
                <div className={`d-flex justify-content-end ${isSentByMe ? 'text-white-50' : 'text-muted'}`}>
                  <small style={{ fontSize: '0.7rem' }}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </small>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      content: PropTypes.string,
      sender_id: PropTypes.string,
      created_at: PropTypes.string,
      read: PropTypes.bool,
      sender: PropTypes.shape({
        profile_photo: PropTypes.string,
        firstname: PropTypes.string,
        lastname: PropTypes.string
      })
    })
  ),
  currentUser: PropTypes.shape({
    id: PropTypes.string
  })
};

export default MessageList;

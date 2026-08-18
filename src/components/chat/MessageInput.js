'use client';
import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import PropTypes from 'prop-types';

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-container p-2">
      <div className="d-flex align-items-center">
        <textarea
          className="form-control py-2 px-3"
          rows={1}
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{
            resize: 'none',
            borderRadius: '24px',
            paddingRight: '40px',
            fontSize: '0.95rem',
            backgroundColor: '#f0f2f5'
          }}
        />
        <button 
          type="submit" 
          className="btn btn-link send-button"
          disabled={!message.trim() || disabled}
          style={{
            marginLeft: '-40px',
            zIndex: 2,
            color: message.trim() ? '#0095f6' : '#bbb'
          }}
        >
          <FiSend size={20} />
        </button>
      </div>
    </form>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default MessageInput;

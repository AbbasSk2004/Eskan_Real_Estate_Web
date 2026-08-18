'use client';

import React from 'react';
import { Modal, Collapse } from 'react-bootstrap';
import PropertyInquiryForm from './PropertyInquiryForm';
import { getImageUrl } from '../../utils/imageUtils';

const ContactOwnerModal = ({
  show,
  onHide,
  owner,
  user,
  propertyId,
  inquiryOpen,
  onToggleInquiry,
  onSendMessage,
  onInquiryClick
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title as="h5" className="fw-bold">
          Connect with Owner
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-2">
        {owner && (
          <div className="owner-summary d-flex align-items-center mb-3">
            <div className="owner-avatar rounded-circle overflow-hidden me-3">
              {owner.profile_photo ? (
                <img
                  src={getImageUrl(owner.profile_photo)}
                  alt={`${owner.firstname || ''} ${owner.lastname || ''}`.trim()}
                  width={48}
                  height={48}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light text-primary w-100 h-100">
                  <i className="fas fa-user fa-lg"></i>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="fw-bold text-dark text-truncate">
                {(owner.firstname || 'Property') + ' ' + (owner.lastname || 'Owner')}
              </div>
              <small className="text-muted">Property Owner</small>
            </div>
          </div>
        )}
        <div className="contact-actions d-grid gap-2">
          <button
            onClick={onSendMessage}
            className="btn btn-primary btn-lg"
          >
            <i className="fas fa-comments me-2"></i>
            Send Message
          </button>

          <button
            className="btn btn-outline-secondary"
            type="button"
            aria-expanded={inquiryOpen}
            aria-controls="inquiryFormCollapse"
            onClick={() => {
              if (!user) {
                onInquiryClick();
                return;
              }
              onToggleInquiry();
            }}
          >
            <i className="fas fa-envelope me-2"></i>
            Inquiry
          </button>
        </div>
        <Collapse in={user ? inquiryOpen : false}>
          <div id="inquiryFormCollapse" className="mt-3">
            <PropertyInquiryForm propertyId={propertyId} />
          </div>
        </Collapse>
      </Modal.Body>
    </Modal>
  );
};

export default ContactOwnerModal;
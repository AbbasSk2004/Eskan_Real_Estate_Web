'use client';
import React, { useState } from 'react';

const FAQ = ({ faqs, title, searchable = true, categoryFilter = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories if categoryFilter is enabled
  const categories = categoryFilter 
    ? ['all', ...new Set(faqs.map(faq => faq.category).filter(Boolean))]
    : [];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="faq-component">
      {title && (
        <div className="text-center mb-5">
          <h2 className="text-primary">{title}</h2>
        </div>
      )}

      {/* Search and Filter Controls */}
      {(searchable || categoryFilter) && (
        <div className="faq-controls mb-4">
          <div className="row">
            {searchable && (
              <div className={categoryFilter ? 'col-md-8' : 'col-12'}>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fa fa-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                </div>
              </div>
            )}
            
            {categoryFilter && (
              <div className={searchable ? 'col-md-4' : 'col-12'}>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="mb-3">
          <small className="text-muted">
            {filteredFaqs.length} result(s) found
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </small>
        </div>
      )}

      {/* FAQ List */}
      <div className="faq-list">
        {filteredFaqs.map((faq, index) => (
          <div key={index} className="faq-item mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <button
                  className="btn btn-link text-decoration-none w-100 text-start p-0 d-flex align-items-center justify-content-between"
                  onClick={() => toggleFaq(index)}
                  style={{ color: 'inherit' }}
                >
                  <div className="d-flex align-items-center">
                    <i className="fa fa-question-circle text-primary me-3"></i>
                    <span className="fw-semibold">{faq.question}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    {faq.category && categoryFilter && (
                      <span className="badge bg-secondary me-2">{faq.category}</span>
                    )}
                    <i className={`fa fa-chevron-${expandedFaq === index ? 'up' : 'down'} text-muted`}></i>
                  </div>
                </button>
              </div>
              
              {expandedFaq === index && (
                <div className="card-body">
                  <div className="d-flex">
                    <i className="fa fa-lightbulb text-warning me-3 mt-1"></i>
                    <div>
                      <p className="mb-0 text-muted">{faq.answer}</p>
                      {faq.links && faq.links.length > 0 && (
                        <div className="mt-3">
                          <small className="text-muted d-block mb-2">Related links:</small>
                          {faq.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              className="btn btn-sm btn-outline-primary me-2 mb-1"
                              target={link.external ? '_blank' : '_self'}
                              rel={link.external ? 'noopener noreferrer' : ''}
                            >
                              {link.text}
                              {link.external && <i className="fa fa-external-link-alt ms-1"></i>}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFaqs.length === 0 && (
        <div className="text-center py-5">
          <i className="fa fa-search fa-3x text-muted mb-3"></i>
          <h5>No FAQs found</h5>
          <p className="text-muted">
            {searchTerm 
              ? 'Try adjusting your search terms or browse all categories.'
              : 'No FAQs available in this category.'
            }
          </p>
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FAQ;
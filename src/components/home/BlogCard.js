import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/BlogCard.css';
import { formatDate } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUtils';

const BlogCard = ({ blog }) => {
  const {
    slug,
    title,
    excerpt,
    image_url,
    image,
    coverImage,
    category,
    created_at
  } = blog;

  return (
    <div className="blog-card rounded overflow-hidden shadow-sm h-100">
      <div className="position-relative overflow-hidden">
        <img 
          className="img-fluid w-100 blog-image" 
          src={getImageUrl(image_url || image || coverImage)} 
          alt={title}
          onError={(e) => {
            e.target.src = '/img/default-blog.jpg';
            e.target.onerror = null;
          }}
        />
        {category && (
          <Link 
            className="category-badge position-absolute top-0 start-0 bg-primary text-white rounded-end mt-4 py-2 px-4" 
            to={`/blogs/category/${category.toLowerCase()}`}
          >
            {category}
          </Link>
        )}
      </div>
      <div className="p-4">
        <h3 className="card-title">
          <Link to={`/blogs/${slug}`} className="text-decoration-none text-dark">
            {title}
          </Link>
        </h3>
        <p className="card-text text-muted">
          {excerpt || ''}
        </p>
        <div className="meta-info d-flex align-items-center mt-3">
          <small className="text-muted">
            <i className="far fa-calendar-alt me-2"></i>
            {formatDate(created_at)}
          </small>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 
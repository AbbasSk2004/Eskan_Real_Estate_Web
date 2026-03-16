import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { endpoints } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '../utils/formatters';
import { getImageUrl } from '../utils/imageUtils';
import '../assets/css/BlogDetail.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await endpoints.blogs.getBySlug(slug);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to fetch blog');
        }
        setBlog(response.data.data);
      } catch (err) {
        console.error('Blog fetch error:', err);
        setError(err.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-danger mb-3">{error || 'Blog not found'}</h3>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          <i className="fa fa-arrow-left me-2"></i>Go Back
        </button>
      </div>
    );
  }

  const { title, image_url, image, coverImage, category, created_at, content } = blog;

  return (
    <section className="blog-detail py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="blog-header mb-4 text-center">
              {category && (
                <Link
                  to={`/blogs/category/${category.toLowerCase()}`}
                  className="badge bg-primary text-decoration-none mb-3"
                >
                  {category}
                </Link>
              )}
              <h1 className="fw-bold mb-3">{title}</h1>
              <p className="text-muted">
                <i className="far fa-calendar-alt me-2"></i>
                {formatDate(created_at)}
              </p>
            </div>

            {(image_url || image || coverImage) && (
              <div className="blog-image-wrapper mb-4">
                <img
                  src={getImageUrl(image_url || image || coverImage)}
                  alt={title}
                  className="img-fluid rounded w-100"
                  onError={(e) => {
                    e.target.src = '/img/default-blog.jpg';
                    e.target.onerror = null;
                  }}
                />
              </div>
            )}

            <article className="blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetail; 
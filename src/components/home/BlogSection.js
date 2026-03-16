import React, { useState, useEffect } from 'react';
import { endpoints } from '../../services/api';
import BlogCard from './BlogCard';
import '../../assets/css/BlogSection.css';

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await endpoints.blogs.getRecent();
        
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to fetch blogs');
        }
        
        setBlogs(response.data.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError(error.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  if (!blogs.length) {
    return null;
  }

  return (
    <section className="blog-section py-5">
      <div className="container">
        <div className="blog-title-wrapper mb-4 mb-md-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="blog-title-container">
            <div className="blog-line" />
            <h2 className="blog-title">Latest Blog Posts</h2>
            <div className="blog-line" />
          </div>
          <p className="blog-subtitle">Stay updated with our latest news and insights</p>
        </div>

        <div className="row g-3 g-md-4">
          {blogs.map(blog => (
            <div key={blog.id || blog._id} className="col-12 col-sm-6 col-lg-4 mb-3 mb-md-4">
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection; 
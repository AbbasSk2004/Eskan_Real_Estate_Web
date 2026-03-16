import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { endpoints } from '../services/api';
import BlogCard from '../components/home/BlogCard';
import '../assets/css/BlogSection.css';

const Blogs = () => {
  const { category: categoryParam } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await endpoints.blogs.getAll({ page, limit: 9, category: categoryParam });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch blogs');
      }
      const { blogs: list, pages: totalPages } = response.data.data;
      setBlogs(list);
      setPages(totalPages);
    } catch (err) {
      console.error('Blogs fetch error:', err);
      setError(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Re-run when category changes
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container py-5 text-center text-danger">{error}</div>;
  }

  return (
    <section className="blog-section py-5">
      <div className="container">
        <div className="blog-title-wrapper mb-5">
          <div className="blog-title-container">
            <div className="blog-line" />
            <h2 className="blog-title">Blog</h2>
            <div className="blog-line" />
          </div>
          <p className="blog-subtitle">Learn, explore and stay up-to-date</p>
        </div>

        <div className="row">
          {blogs.map((blog) => (
            <div key={blog.id || blog._id} className="col-md-4 mb-4">
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>

        {pages > 1 && (
          <nav aria-label="Blog pagination" className="mt-4">
            <ul className="pagination justify-content-center">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <Link
                    className="page-link"
                    to={`?page=${p}`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
};

export default Blogs;

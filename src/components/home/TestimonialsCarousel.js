import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { endpoints } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Testimonials.css';
import LoadingSpinner from '../common/LoadingSpinner';

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await endpoints.testimonials.getAll();
        
        if (response?.success && Array.isArray(response.data)) {
          setTestimonials(response.data);
          setError(null);
        } else {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError('Failed to load testimonials');
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!testimonials.length) return null;

  const settings = {
    dots: true,
    infinite: testimonials.length > 2,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: testimonials.length > 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          infinite: testimonials.length > 1
        }
      }
    ]
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center mx-auto mb-4 mb-md-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
          <h1 className="mb-3" style={{ fontSize: 'calc(1.5rem + 1vw)' }}>Our Clients Say!</h1>
          <p className="px-3">Read what our satisfied clients have to say about their experience with us.</p>
        </div>
        <div className="testimonial-carousel wow fadeInUp" data-wow-delay="0.1s">
          <Slider {...settings}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-item">
                <div className="bg-light rounded p-4">
                  <div className="d-flex align-items-center mb-3 mb-md-4">
                    <img
                      src={getImageUrl(testimonial.profiles?.profile_photo)}
                      alt={`${testimonial.profiles?.firstname || ''} ${testimonial.profiles?.lastname || ''}`.trim()}
                      className="testimonial-profile-img flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/default-profile.jpg';
                      }}
                    />
                    <div className="ms-3 ms-md-4">
                      <h5 className="mb-1">{`${testimonial.profiles.firstname} ${testimonial.profiles.lastname}`}</h5>
                      <div className="rating">
                        {[...Array(5)].map((_, index) => (
                          <span 
                            key={index} 
                            className={index < testimonial.rating ? 'text-warning' : 'text-secondary'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="testimonial-text">
                    <p className="mb-0">{testimonial.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;

'use client';

import React from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../assets/css/HeaderCarousel.css';

const Hero = () => {
  const settings = {
    autoplay: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    arrows: true,
    fade: true,
    cssEase: 'linear',
    autoplaySpeed: 3000
  };

  return (
    <div className="container-fluid header p-0">
      <div className="row g-0 align-items-center flex-column-reverse flex-md-row">
        <div className="col-md-6 p-4 p-md-5 mt-3 mt-lg-5">
          <h1 className="display-5 animated fadeIn mb-3 mb-md-4" style={{ fontSize: 'calc(1.5rem + 2vw)' }}>
            Find Your <span className="text-primary">Dream Property</span> Today
          </h1>
          <p className="animated fadeIn mb-3 mb-md-4 pb-2">
            Explore a curated selection of homes, apartments, and investment properties. Let us help you find the perfect place to call home.
          </p>
          <Link href="/properties" className="btn btn-primary py-2 py-md-3 px-4 px-md-5 me-3 animated fadeIn">
            Get Started
          </Link>
        </div>
        <div className="col-md-6 animated fadeIn">
          <Slider {...settings}>
            <div className="slider-item">
              <img loading="eager" className="img-fluid w-100" src="/img/carousel-1.jpg" alt="Property Carousel" style={{ objectFit: 'cover', maxHeight: '600px' }} />
            </div>
            <div className="slider-item">
              <img loading="eager" className="img-fluid w-100" src="/img/carousel-2.jpg" alt="Property Carousel" style={{ objectFit: 'cover', maxHeight: '600px' }} />
            </div>
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Hero;

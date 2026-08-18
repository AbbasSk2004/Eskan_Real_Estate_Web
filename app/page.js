import Hero from '../src/components/home/Hero';
import PropertyTypes from '../src/components/home/PropertyTypes';
import PropertyCarousel from '../src/components/home/PropertyCarousel';
import FeaturedProperties from '../src/components/home/FeaturedProperties';
import TestimonialsCarousel from '../src/components/home/TestimonialsCarousel';
import CallToAction from '../src/components/home/CallToAction';
import { homeApi } from '../lib/api';

export const revalidate = 3600;

export const metadata = {
  title: 'Find Your Dream Property in Lebanon',
  description: 'Browse apartments, houses, villas and commercial properties across Lebanon with ESKAN Real Estate. Buy, rent, or list your property today.'
};

export default async function HomePage() {
  let homeData = {};

  try {
    homeData = await homeApi.data();
  } catch (error) {
    // Home sections fall back to client-side fetching when the API is unavailable.
  }

  return (
    <>
      <Hero />
      {/*
        Deliberately NOT seeded with homeData.recommended: this slot is
        per-visitor. ISR caches one HTML payload for `revalidate` seconds and
        serves it to everyone, so any pre-rendered list here would be identical
        for all users — and PropertyCarousel skips its fetch entirely when
        given initialProperties. Rendering client-side is what lets the request
        carry the visitor/session cookie the ranker personalizes on.
      */}
      <PropertyCarousel />
      <PropertyTypes />
      <FeaturedProperties initialProperties={homeData.featured} />
      <TestimonialsCarousel initialTestimonials={homeData.testimonials} />
      <CallToAction />
    </>
  );
}
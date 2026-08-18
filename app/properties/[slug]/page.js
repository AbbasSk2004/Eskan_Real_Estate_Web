import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PropertyDetail from '../../../src/components/properties/PropertyDetail';
import { propertiesApi } from '../../../lib/api';
import { getImageUrl } from '../../../src/utils/imageUtils';

export const revalidate = 3600;

export const dynamicParams = true;

function buildPropertyMetadata(property, slug) {
  const title = property.title || `${property.property_type || 'Property'} in ${property.city || 'Lebanon'}`;
  const address = [property.village, property.city, property.governate || property.governorate].filter(Boolean).join(', ');
  const description = property.description
    ? `${property.description}`.slice(0, 155)
    : `${title} — ${property.status || 'available'} in ${address || 'Lebanon'}`;
  const images = [
    property.main_image?.url,
    property.mainImage?.url,
    property.main_image,
    property.images?.[0]?.url
  ].filter(Boolean);

  return {
    title,
    description,
    alternates: { canonical: `/properties/${slug || property.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      images: images.map((url) => getImageUrl(url))
    }
  };
}

function buildPropertyJsonLd(property) {
  const addressParts = [property.village, property.city, property.governate || property.governorate].filter(Boolean);
  const price = Number(property.price);
  const imageUrl = getImageUrl(
    property.main_image?.url ||
    property.mainImage?.url ||
    property.main_image ||
    property.images?.[0]?.url
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title || 'Property for sale',
    description: property.description || undefined,
    image: imageUrl || undefined,
    url: `https://eskan.example/properties/${property.slug || property.id}`,
    datePosted: property.createdAt || undefined,
    offers: price
      ? {
          '@type': 'Offer',
          price: price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      : undefined,
    address: addressParts.length
      ? {
          '@type': 'PostalAddress',
          addressLocality: property.city,
          addressRegion: property.governate || property.governorate,
          streetAddress: property.village,
          addressCountry: 'LB'
        }
      : undefined,
    numberOfRooms: property.bedrooms ? Number(property.bedrooms) : undefined,
    numberOfBathroomsTotal: property.bathrooms ? Number(property.bathrooms) : undefined,
    floorSize: property.area
      ? { '@type': 'QuantitativeValue', value: Number(property.area), unitCode: 'MTK' }
      : undefined
  };
}

export async function generateMetadata({ params }) {
  try {
    const property = await propertiesApi.byId(params.slug);
    if (!property) return {};
    return buildPropertyMetadata(property, params.slug);
  } catch (error) {
    return {};
  }
}

export default async function PropertyDetailPage({ params }) {
  let property;
  try {
    property = await propertiesApi.byId(params.slug);
  } catch (error) {
    property = null;
  }

  if (!property) {
    notFound();
    return null;
  }

  const jsonLd = buildPropertyJsonLd(property);

  return (
    <>
      <Suspense fallback={<div className="container py-5 text-center">Loading property...</div>}>
        <PropertyDetail initialProperty={property} />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
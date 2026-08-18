import Link from 'next/link';
import PageHeader from '../../src/components/common/PageHeader';
import { faqsApi } from '../../lib/api';
import FAQ from '../../src/components/common/FAQ';

export const revalidate = 3600;

export const metadata = {
  title: 'Help & Support',
  description: 'Find answers to frequently asked questions about ESKAN Real Estate — registration, verification, searching properties, listings, and more.'
};

async function fetchFaqs() {
  try {
    const data = await faqsApi.all();
    if (!data) return [];
    return data.faqs || data.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    return [];
  }
}

function buildFaqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export default async function HelpPage() {
  const faqs = await fetchFaqs();
  const jsonLd = faqs.length ? buildFaqJsonLd(faqs) : null;

  return (
    <>
      <PageHeader title="Help & Support" crumb="Help" />
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {faqs.length > 0 ? (
                <FAQ faqs={faqs} title="Frequently Asked Questions" searchable categoryFilter />
              ) : (
                <div className="text-center py-5">
                  <h4 className="text-muted mb-3">No FAQs available right now.</h4>
                  <Link href="/contact" className="btn btn-primary">
                    <i className="fa fa-envelope me-2"></i>Contact Support
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
    </>
  );
}
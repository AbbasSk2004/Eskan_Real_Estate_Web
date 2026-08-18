import ContactForm from '../../src/components/contact/ContactForm';
import ContactInfo from '../../src/components/contact/ContactInfo';
import { faqsApi } from '../../lib/api';
import FAQ from '../../src/components/common/FAQ';

export const revalidate = 3600;

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ESKAN Real Estate team. Call, email, or send us a message — we are here to help you buy, sell, or rent property in Lebanon.'
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

export default async function ContactPage() {
  const faqs = await fetchFaqs();

  return (
    <>
      <div className="container-xxl pt-5 mt-5">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="text-primary">Get In Touch</h1>
            <p className="text-muted">We would love to hear from you. Send us a message and we will respond as soon as possible.</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-7">
              <ContactForm />
            </div>
            <div className="col-lg-5">
              <ContactInfo variant="card" />
            </div>
          </div>
        </div>
      </div>
      {faqs.length > 0 && (
        <div className="container-xxl pb-5" id="faqs">
          <div className="container">
            <FAQ faqs={faqs} title="Frequently Asked Questions" searchable={false} />
          </div>
        </div>
      )}
    </>
  );
}
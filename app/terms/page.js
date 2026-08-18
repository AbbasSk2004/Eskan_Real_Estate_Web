import LegalDocument from '../../src/components/legal/LegalDocument';

export const metadata = {
  title: 'Terms and Conditions',
  description: 'Read the ESKAN Real Estate terms and conditions that govern your use of the platform and its services.'
};

export default function TermsPage() {
  return <LegalDocument type="terms" />;
}
import LegalDocument from '../../src/components/legal/LegalDocument';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read the ESKAN Real Estate privacy policy to understand how we collect, use, and protect your personal information.'
};

export default function PrivacyPage() {
  return <LegalDocument type="privacy" />;
}
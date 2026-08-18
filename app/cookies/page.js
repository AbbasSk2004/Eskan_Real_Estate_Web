import LegalDocument from '../../src/components/legal/LegalDocument';

export const metadata = {
  title: 'Cookie Policy',
  description: 'Read the ESKAN Real Estate cookie policy to understand how cookies are used on the platform.'
};

export default function CookiesPage() {
  return <LegalDocument type="cookies" />;
}
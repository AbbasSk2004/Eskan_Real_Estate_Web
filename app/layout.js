import './globals.css';

// Vendor CSS (order matters — Bootstrap first, then overrides)
import '../src/assets/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'animate.css/animate.min.css';

// Custom styles
import '../src/assets/css/fonts.css';
import '../src/assets/css/global.css';
import '../src/assets/css/scroll.css';
import '../src/assets/css/style.css';

import AppProviders from '../src/components/layout/AppProviders';
import Navbar from '../src/components/layout/Navbar';
import Footer from '../src/components/layout/Footer';

export const metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  title: {
    default: 'ESKAN Real Estate — Find Your Home in Lebanon',
    template: '%s | ESKAN Real Estate'
  },
  description:
    'ESKAN is a Lebanese real estate platform for buying, selling, and renting properties. Search apartments, houses, land, and more across Lebanon.',
  keywords: ['real estate', 'Lebanon', 'properties for sale', 'apartments', 'rent Beirut', 'ESKAN'],
  openGraph: {
    title: 'ESKAN Real Estate',
    description:
      'Discover properties across Lebanon — apartments, houses, land and more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ESKAN Real Estate'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESKAN Real Estate',
    description: 'Discover properties across Lebanon — apartments, houses, land and more.'
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111111'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
// app/layout.js
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { DarkModeProvider } from '../lib/darkMode';
import ScrollToTop from '../components/ScrollToTop';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://alnoormasjid.org'),
  title: {
    default: 'Al-Noor Masjid | Donation Platform',
    template: '%s | Al-Noor Masjid',
  },
  description: 'Support your community — donate to Al-Noor Masjid campaigns. Fund education, feed families, build the Masjid. Every cent earns barakah.',
  keywords: ['masjid', 'donation', 'zakat', 'sadaqah', 'islamic charity', 'al-noor', 'muslim community'],
  openGraph: {
    type: 'website',
    title: 'Al-Noor Masjid — Donation Platform',
    description: 'Give Sadaqah. Change Lives. Support campaigns for education, food, the Masjid, and more.',
    siteName: 'Al-Noor Masjid',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#1a5c38',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DarkModeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' },
              success: {
                style: { background: '#1a5c38', color: '#fff' },
                iconTheme: { primary: '#c9973a', secondary: '#fff' },
              },
              error: { style: { background: '#dc2626', color: '#fff' } },
            }}
          />
        </DarkModeProvider>
      </body>
    </html>
  );
}

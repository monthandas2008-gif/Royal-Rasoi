import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import GlobalChatbotDrawer from '@/components/chat/GlobalChatbotDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Royal Rasoi — Fine Indian Dining | Boisar',
    template: '%s | Royal Rasoi',
  },
  description:
    'Experience the royal flavors of India at Royal Rasoi, Boisar\'s premier fine dining restaurant. Book your table online for an unforgettable culinary journey.',
  keywords: [
    'Royal Rasoi',
    'restaurant Boisar',
    'Indian dining',
    'table booking',
    'fine dining',
    'Indian cuisine',
    'restaurant reservation',
  ],
  authors: [{ name: 'Royal Rasoi' }],
  creator: 'Royal Rasoi',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://royalrasoi.com',
    siteName: 'Royal Rasoi',
    title: 'Royal Rasoi — Fine Indian Dining | Boisar',
    description:
      'Experience the royal flavors of India at Royal Rasoi. Book your table online.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Royal Rasoi Restaurant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royal Rasoi — Fine Indian Dining | Boisar',
    description:
      'Experience the royal flavors of India at Royal Rasoi. Book your table online.',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop',
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-[#FAF9F0] text-[#292524]">
        <Navbar />
        <main>{children}</main>
        <GlobalChatbotDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FAF9F0',
              color: '#292524',
              border: '1px solid #D4AF37',
              borderRadius: '8px',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            },
            success: {
              iconTheme: {
                primary: '#1A5C1A',
                secondary: '#FAF9F0',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FAF9F0',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Innovators Hub - Seville',
  description: 'Community platform for digital nomads and innovators in Seville, Spain',
  keywords: ['coworking', 'digital nomads', 'seville', 'events', 'networking'],
  authors: [{ name: 'Innovators Hub' }],
  openGraph: {
    title: 'Innovators Hub - Seville',
    description: 'Join our community of digital nomads and innovators',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}




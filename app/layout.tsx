import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TokenBot Status',
  description: 'Real-time status and uptime monitoring for TokenBot services',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'TokenBot Status',
    description: 'Real-time status and uptime monitoring for TokenBot services',
    type: 'website',
    url: 'https://status.tokenbot.com',
  },
  twitter: {
    card: 'summary',
    title: 'TokenBot Status',
    description: 'Real-time status and uptime monitoring for TokenBot services',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

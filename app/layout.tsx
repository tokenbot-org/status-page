import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TokenBot® Status',
  description: 'TokenBot System Status',
  icons: {
    icon: [
      { url: '/TokenBot-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/TokenBot-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/TokenBot-180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/TokenBot.ico',
  },
  manifest: '/manifest.json',
  themeColor: '#FFD60A',
  openGraph: {
    title: 'TokenBot® Status',
    description: 'TokenBot System Status',
    type: 'website',
    url: 'https://status.tokenbot.com',
  },
  twitter: {
    card: 'summary',
    title: 'TokenBot® Status',
    description: 'TokenBot System Status',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

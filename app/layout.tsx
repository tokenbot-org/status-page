import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

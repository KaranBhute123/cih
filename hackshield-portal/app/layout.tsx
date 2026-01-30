import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HackShield Portal - The Future of Hackathons',
  description: 'Complete hackathon management platform with lockdown IDE, neural fairness engine, and contributor marketplace',
  keywords: 'hackathon, coding, competition, IDE, collaboration, blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-950 text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

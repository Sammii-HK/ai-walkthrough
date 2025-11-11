import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Walkthrough',
  description: 'AI-powered product video automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aquaculture Water Quality Dashboard',
  description: 'IMTA Water Quality Monitoring System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}


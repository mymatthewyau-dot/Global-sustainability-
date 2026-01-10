import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { FarmProvider } from '@/lib/farm-context';

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
      <body className="antialiased">
        <AuthProvider>
          <FarmProvider>{children}</FarmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


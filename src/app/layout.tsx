import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MatchPoint AI',
  description: 'AI-powered talent matching — find your perfect role',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-base text-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'DocSense AI — Intelligent Knowledge Engine',
  description:
    'Upload your documents and unlock AI-powered search, chat, and insights. Your personal knowledge base with intelligent retrieval.',
  keywords: [
    'AI search',
    'knowledge base',
    'document search',
    'RAG',
    'AI chat',
    'semantic search',
  ],
  authors: [{ name: 'DocSense AI' }],
  openGraph: {
    title: 'DocSense AI — Intelligent Knowledge Engine',
    description:
      'Upload your documents and unlock AI-powered search, chat, and insights.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable}`}>
      <body
        className={`${outfit.className} bg-[hsl(220,30%,3%)] text-[hsl(220,20%,95%)] antialiased`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

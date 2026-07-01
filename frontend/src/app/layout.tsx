import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NeuralVault — AI Knowledge Search Engine',
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
  authors: [{ name: 'NeuralVault' }],
  openGraph: {
    title: 'NeuralVault — AI Knowledge Search Engine',
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
    <html lang="en" className={`dark ${inter.variable}`}>
      <body
        className={`${inter.className} bg-[hsl(230,25%,5%)] text-[hsl(220,20%,95%)] antialiased`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

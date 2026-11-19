import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Roadmap.sh MVP - System Design & Interactive Developer Roadmaps',
  description: 'Nền tảng học System Design và lập trình tương tác với Next.js, Supabase và React Flow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#0a0e17] text-slate-100 min-h-screen antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

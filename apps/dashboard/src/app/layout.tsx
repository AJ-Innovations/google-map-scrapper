import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lead Collection Platform",
  description: "Internal lead extraction engine dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-bg-primary text-text-primary min-h-screen flex selection:bg-accent-primary/30`} suppressHydrationWarning>
        <Providers>
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r border-border-color bg-bg-secondary flex flex-col shrink-0 sticky top-0 h-screen z-10 shadow-sm">
            <div className="h-16 flex items-center px-6 border-b border-border-color">
              <span className="font-bold text-lg flex items-center gap-2">
                <span className="text-accent-primary">⚡</span> Lead Platform
              </span>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
              <Link href="/" className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-3">
                <span className="text-text-muted">📊</span> Dashboard
              </Link>
              
              <div className="mt-4 mb-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Scraping Engine</div>
              
              <Link href="/jobs/new" className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-3">
                <span className="text-text-muted">🔍</span> New Search
              </Link>
              
              <div className="mt-4 mb-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Management</div>
              
              <Link href="/leads" className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-3">
                <span className="text-text-muted">👥</span> Leads CRM
              </Link>
            </nav>
            
            <div className="p-4 border-t border-border-color">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-tertiary/50 border border-border-color">
                <div className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  AD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Admin User</span>
                  <span className="text-xs text-text-muted">System Admin</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-glass-bg">
            <header className="h-16 border-b border-border-color bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
              <div className="text-sm font-medium text-text-secondary">
                Connected to Engine
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="text-sm text-text-secondary font-medium">System Online</span>
              </div>
            </header>
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lead Platform",
  description: "Internal Lead Generation and Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <div className="flex h-screen w-screen overflow-hidden font-sans bg-bg-primary text-text-primary">
          <aside className="w-[280px] bg-bg-secondary border-r border-border-color flex flex-col p-6 z-10">
            <div className="text-xl font-bold mb-8 flex items-center gap-2">
              <span className="text-accent-primary">⚡</span> Lead Platform
            </div>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-3 rounded-md font-medium transition-colors duration-150 flex items-center gap-3 bg-accent-glow text-accent-primary">
                Dashboard
              </Link>
              <Link href="/jobs/new" className="px-4 py-3 rounded-md font-medium transition-colors duration-150 flex items-center gap-3 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary">
                New Search
              </Link>
              <Link href="/leads" className="px-4 py-3 rounded-md font-medium transition-colors duration-150 flex items-center gap-3 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary">
                Leads CRM
              </Link>
            </nav>
          </aside>
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-[70px] border-b border-border-color bg-glass-bg backdrop-blur-md flex items-center justify-between px-8 z-10">
              <div className="text-text-secondary">Welcome, Admin</div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 bg-bg-primary">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

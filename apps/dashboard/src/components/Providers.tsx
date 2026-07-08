"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-bg-secondary text-text-primary border border-border-color shadow-lg',
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#09090b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#09090b',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

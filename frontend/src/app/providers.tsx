"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/authStore";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const initializeAuth = useAuthStore((state) => state.initialize);
  const [toasterPosition, setToasterPosition] = useState<"top-center" | "bottom-right">("top-center");

  useEffect(() => {
    initializeAuth();
    const updatePosition = () => {
      if (window.innerWidth < 768) {
        setToasterPosition("top-center");
      } else {
        setToasterPosition("bottom-right");
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="data-theme" defaultTheme="classic" enableSystem={false}>
        {children}
        <Toaster 
          theme="dark" 
          position={toasterPosition}
          closeButton={true}
          duration={4000}
          toastOptions={{
            style: {
              background: "#1A1A1A",
              border: "1px solid rgba(198, 255, 0, 0.2)",
              color: "#F5F5F3",
            },
          }} 
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DSR Go — Smart Autonomous Campus Delivery",
  description: "Advanced Fleet Management & Autonomous Robot Delivery Platform for Silver Oak University.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DSR Delivery",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.variable} font-sans bg-surface-0 text-brand-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

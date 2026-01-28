import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/lib/queryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Digital Presence Platform (BDPP)",
  description: "A streamlined platform for professional business digital profiles",
  keywords: ["BDPP", "Business", "Digital Presence", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "BDPP Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Business Digital Presence Platform",
    description: "Professional digital profiles for every business",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Digital Presence Platform",
    description: "Professional digital profiles for every business",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
     
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

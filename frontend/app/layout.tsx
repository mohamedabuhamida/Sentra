import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "Sentra | Intelligent AI Gateway & Security",
  description:
    "Intelligent GenAI gateway and security platform. Model routing, prompt injection defense, semantic caching, and full observability.",
  icons: {
    icon: "/sentra-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

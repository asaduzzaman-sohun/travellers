import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Traveller's | Peaceful Travel & Community for Bangladesh",
    template: "%s | Traveller's Bangladesh",
  },
  description:
    "Discover the natural serenity of Bangladesh. Curated tour packages, honest resort reviews, travel guidelines, and traveler stories for Sajek, Tanguar Haor, Sreemangal, Sundarbans, and Cox's Bazar.",
  keywords: [
    "Bangladesh travel",
    "Sajek Valley tour",
    "Tanguar Haor houseboat",
    "Sreemangal tea garden",
    "Sundarbans eco cruise",
    "Cox's Bazar beach",
    "Bandarban trekking",
    "Saint Martin coral island",
    "Bangladesh tour packages",
    "Bangladesh eco resorts",
  ],
  authors: [{ name: "Traveller's Team", url: "http://localhost:3000" }],
  openGraph: {
    title: "Traveller's | Peaceful Travel & Community for Bangladesh",
    description:
      "Curated travel packages, verified eco-resort reviews, and authentic travel community stories across Bangladesh.",
    url: "http://localhost:3000",
    siteName: "Traveller's Bangladesh",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traveller's | Peaceful Travel & Community for Bangladesh",
    description:
      "Discover the natural serenity of Bangladesh. Curated travel guides, honest resort reviews, and traveler discussions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-stone-800 selection:bg-stone-900 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col pb-14 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

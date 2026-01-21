import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import Vignette from "@/components/Vignette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Novum Digital | Premium Web Development",
  description:
    "High-end web solutions specialized in medical and corporate platforms. Crafting exceptional digital experiences.",
  keywords: [
    "developer",
    "web development",
    "Novum Digital",
    "React",
    "Next.js",
    "TypeScript",
    "portfolio",
  ],
  authors: [{ name: "Mathijs" }],
  openGraph: {
    title: "Novum Digital | Premium Web Development",
    description:
      "High-end web solutions specialized in medical and corporate platforms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise`}
      >
        <SmoothScroll>
          <Vignette />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

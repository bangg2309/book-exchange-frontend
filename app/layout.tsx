import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import AuthInitializer from "@/components/AuthInitializer";
import AuthStateInitializer from "@/components/AuthStateInitializer";
import { ToastContainer } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booke Exchange - Mua và Bán Sách Cũ",
  description: "Sàn thương mại điện tử cho sinh viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="mdl-js">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthStateInitializer />
        <AuthInitializer />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

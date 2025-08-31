import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ClientWrapper from "@/components/wrapper/ClientWrapper";
import Footer from "@/components/organisms/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Starry Night NFT Drop",
  description: "Mint and collect your unique Starry Night NFTs on the blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} antialiased min-h-dvh flex flex-col`}
      >
        <ClientWrapper>
          {/* <Navbar /> */}
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientWrapper>
        <Toaster richColors />
      </body>
    </html>
  );
}

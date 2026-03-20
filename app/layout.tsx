import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NanoMint | Premium Certificate Editor",
  description: "The modern, intuitive certificate design studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased dark`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@100..900&family=Great+Vibes&family=Roboto:wght@100..900&family=Cinzel:wght@400..900&family=Prata&family=Alex+Brush&family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-inter">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
const font = DM_Sans({ subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: "PanenLink",
  description: "Smart backhaul untuk rantai pasok hasil panen",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={font.className}>{children}</body>
    </html>
  );
}

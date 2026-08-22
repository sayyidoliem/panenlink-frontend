import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
const manrope = Manrope({ subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: "PanenLink",
  description: "Agritech logistics marketplace",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}

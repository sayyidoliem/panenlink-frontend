import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AppProvider } from "@/shared/app/AppProvider";
import "./globals.css";
const font = Manrope({ subsets: ["latin"] });
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
    <html lang="id" suppressHydrationWarning>
      <body className={font.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "@/components/WalletContextProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snake Surge 🐍 - Web3 Ular Tangga Game on Solana",
  description:
    "Snake Surge - Permainan Ular Tangga Web3 di blockchain Solana. Mainkan, menangkan, dan dapatkan hadiah dari Prize Pool!",
  keywords:
    "ular tangga, snake ladder, web3, solana, phantom wallet, blockchain game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
// 1. காம்போனென்ட்களை இம்போர்ட் செய்யவும்
import { PromoPopup } from "./components/PromoPopup"; 

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Kestrel Market",
  description: "Dynamic e-commerce CMS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* 2. இங்கே காம்போனென்ட்களைச் சேர்க்கவும் */}
      
        <PromoPopup />
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}


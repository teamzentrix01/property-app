import { Fraunces, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import RegisterSW from "@/components/RegisterSW";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Bhoomi | Plots, Flats & Shops — Direct from Owners & Brokers",
  description:
    "Browse verified plots, flats, shops and offices for sale or rent. Post your property in minutes, or share a curated link with your buyers.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#11161a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${jbMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <RegisterSW />
        <SmoothScroll>
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

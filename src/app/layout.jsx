import { headers } from "next/headers";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import RegisterSW from "@/components/RegisterSW";
import Footer from "@/components/Footer";
import LoginPopupModal from "@/components/LoginPopupModal";
import AccountVerifiedModal from "@/components/AccountVerifiedModal";
import NiaChatbot from "@/components/NiaChatbot";

export const metadata = {
  title: "Bhoomi | Verified Properties Across India",
  description: "Buy, rent or list verified plots, homes, shops and offices across India.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#c41920",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }) {
  const isAdminRoute = (await headers()).get("x-bhoomi-admin-request") === "1";

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full font-body"
      style={{
        "--font-fraunces": "Fraunces, Georgia, serif",
        "--font-work-sans": "'Work Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "--font-jbmono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased pb-16 md:pb-0">
        <RegisterSW />
        <SmoothScroll>
          {!isAdminRoute && <Navbar />}
          {children}
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <LoginPopupModal />}
          {!isAdminRoute && <AccountVerifiedModal />}
          {!isAdminRoute && <NiaChatbot />}
                  </SmoothScroll>
      </body>
    </html>
  );
}

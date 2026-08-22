import { Fraunces, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import RegisterSW from "@/components/RegisterSW";
const fraunces=Fraunces({variable:"--font-fraunces",subsets:["latin"],weight:["500","600","700"],style:["normal","italic"]});
const workSans=Work_Sans({variable:"--font-work-sans",subsets:["latin"],weight:["400","500","600"]});
const jbMono=JetBrains_Mono({variable:"--font-jbmono",subsets:["latin"],weight:["400","500"]});
export const metadata={title:"Bhoomi | Verified Properties Across India",description:"Buy, rent or list verified plots, homes, shops and offices across India.",manifest:"/manifest.json",icons:{icon:[{url:"/icon-192.png",sizes:"192x192",type:"image/png"}],apple:"/icon-192.png"}};
export const viewport={themeColor:"#16302b",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}){return <html lang="en" className={`${fraunces.variable} ${workSans.variable} ${jbMono.variable} h-full`}><body className="min-h-full flex flex-col bg-paper text-ink antialiased pb-16 md:pb-0"><RegisterSW/><SmoothScroll><Navbar/>{children}</SmoothScroll></body></html>}

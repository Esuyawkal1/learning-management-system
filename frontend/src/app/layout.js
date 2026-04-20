import Navbar from "@/components/Navbar";
import ToastViewport from "@/components/common/ToastViewport";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

import { Abhaya_Libre } from "next/font/google";

const abhaya = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // includes Semi Bold
  display: "swap",
});

export const metadata = {
  title: "Tech Learning Platform",
  description: "Online learning platform",
};

export default function RootLayout({ children }) {
 return (
   <html lang="en"> 
   <body className={abhaya.className}> 
    <AuthProvider>
       <Navbar /> 
       <main>{children}
        </main> 
        <ToastViewport /> 
        </AuthProvider> 
        </body> 
        </html> );
   }
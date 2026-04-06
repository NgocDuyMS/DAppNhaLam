import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Private Voting dApp",
  description: "Ứng dụng bỏ phiếu ẩn danh - dAppNhaLam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrapper chính để ép Footer xuống đáy màn hình */}
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar /> 
          
          {/* Phần nội dung linh động */}
          <div className="grow w-full">
            {children}
          </div>

          <Footer /> {/* <-- Gắn Footer vào đây */}
        </div>
      </body>
    </html>
  );
}
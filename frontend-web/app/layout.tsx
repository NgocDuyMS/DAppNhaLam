import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Dòng import này cực kỳ quan trọng để gọi Navbar vào layout
import Navbar from "@/components/Navbar"; 

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
        {/* Đây là vị trí Navbar sẽ xuất hiện ở mọi trang */}
        <Navbar /> 
        
        {/* Phần nội dung của các trang con sẽ nằm ở đây */}
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
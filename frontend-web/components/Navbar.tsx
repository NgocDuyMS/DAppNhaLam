'use client';

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";

export default function Navbar() {
  const { wallet, isConnecting, connectWallet } = useWallet();
  // State để quản lý việc đóng/mở menu trên điện thoại di động
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between max-w-6xl p-4 mx-auto">
        
        {/* Logo */}
        <div className="flex items-baseline gap-6 text-2xl font-extrabold tracking-tight text-blue-600">
          <Link href="/">dAppNhaLam</Link>
          {/* Ẩn link này trên mobile, chỉ hiện trên màn hình to (md:flex) */}
          <Link href="/elections" className="hidden text-base font-medium text-gray-500 transition md:block hover:text-blue-600">
            Danh sách Bầu cử
          </Link>
        </div>
        
        {/* Khu vực Nút kết nối ví (Desktop) & Nút Menu (Mobile) */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            {wallet.isConnected && wallet.address ? (
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full">
                  Chuỗi: {wallet.chainId}
                </span>
                <span className="px-4 py-2 font-mono text-sm font-semibold text-gray-800 bg-gray-100 border rounded-lg shadow-inner">
                  {formatAddress(wallet.address)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-2.5 font-bold text-white transition duration-300 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Đang kết nối..." : "Kết nối Ví"}
              </button>
            )}
          </div>

          {/* Nút Hamburger cho Mobile */}
          <button 
            className="p-2 text-gray-600 md:hidden hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu thả xuống trên điện thoại */}
      {isMobileMenuOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 md:hidden flex flex-col gap-4">
          <Link 
            href="/elections" 
            className="block font-medium text-gray-700 hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Danh sách Bầu cử
          </Link>
          
          {/* Nút kết nối ví bê xuống bản Mobile */}
          {wallet.isConnected && wallet.address ? (
            <div className="p-3 bg-white border rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Ví đã kết nối:</p>
              <p className="font-mono text-sm font-bold text-gray-800">{formatAddress(wallet.address)}</p>
            </div>
          ) : (
            <button
              onClick={() => { connectWallet(); setIsMobileMenuOpen(false); }}
              disabled={isConnecting}
              className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg disabled:opacity-50"
            >
              {isConnecting ? "Đang kết nối..." : "Kết nối Ví"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
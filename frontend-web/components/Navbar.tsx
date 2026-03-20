'use client'; // Dòng lệnh bắt buộc của Next.js để báo rằng file này có dùng React Hook

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";

export default function Navbar() {
  // Gọi cái "não" Web3 mà bạn đã cất công viết ở Ngày 5 ra đây
  const { wallet, isConnecting, connectWallet } = useWallet();

  // Hàm tiện ích để làm ngắn địa chỉ ví cho đẹp giao diện (VD: 0x1234...5678)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-baseline gap-6 text-2xl font-bold text-blue-600">
        <Link href="/">dAppNhaLam</Link>
        {/* Tiện tay mình gắn luôn nút điều hướng sang trang Danh sách hôm qua làm */}
        <Link href="/elections" className="text-base font-medium text-gray-500 transition hover:text-blue-600">
          Danh sách Bầu cử
        </Link>
      </div>
      
      <div>
        {/* Logic Render (Hiển thị có điều kiện): 
            Nếu ví ĐÃ kết nối -> Hiện địa chỉ ví rút gọn
            Nếu ví CHƯA kết nối -> Hiện nút "Kết nối Ví"
        */}
        {wallet.isConnected && wallet.address ? (
          <div className="flex items-center gap-3">
             <span className="hidden px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full md:inline-block">
              Mạng: {wallet.chainId}
            </span>
            <span className="px-4 py-2 font-mono text-sm font-semibold text-gray-700 bg-gray-100 border rounded-lg shadow-inner">
              {formatAddress(wallet.address)}
            </span>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting} // Vô hiệu hóa nút khi đang quay quay chờ kết nối
            className="px-5 py-2 font-semibold text-white transition duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Đang mở MetaMask..." : "Kết nối Ví"}
          </button>
        )}
      </div>
    </nav>
  );
}
import { ethers } from "ethers";

/**
 * Hàm này làm nhiệm vụ quét xem trình duyệt của người dùng
 * đã cài tiện ích ví (như MetaMask) chưa.
 * Nếu có, nó sẽ tạo ra một "BrowserProvider" để Web của bạn 
 * có thể đọc dữ liệu từ Blockchain.
 */
export const getWeb3Provider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    // Khởi tạo cầu nối với ví đang được cài trên trình duyệt
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }
  
  console.warn("Không tìm thấy ví Web3! Vui lòng cài đặt MetaMask.");
  return null;
};

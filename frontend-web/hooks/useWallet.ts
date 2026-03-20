import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WalletState } from "@/types"; // Tận dụng ngay Interface của Ngày 3

export const useWallet = () => {
  // Khởi tạo state quản lý thông tin ví
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
  });
  
  // Trạng thái chờ và bắt lỗi
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm kích hoạt popup MetaMask
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Kiểm tra xem trình duyệt có cài ví chưa
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Vui lòng cài đặt tiện ích ví MetaMask để tiếp tục!");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Lệnh này sẽ mở cửa sổ MetaMask lên yêu cầu người dùng nhập mật khẩu/cấp quyền
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        setWallet({
          address: accounts[0],
          isConnected: true,
          chainId: Number(network.chainId),
        });
      }
    } catch (err: any) {
      // Xử lý trường hợp người dùng ấn "Từ chối" (Reject) trên MetaMask
      if (err.code === 4001) {
        setError("Bạn đã từ chối yêu cầu kết nối ví.");
      } else {
        setError(err.message || "Đã xảy ra lỗi khi kết nối ví.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Lắng nghe sự kiện thay đổi từ phía MetaMask (Đổi tài khoản hoặc Đổi mạng)
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Xử lý khi người dùng chọn tài khoản khác trên ví
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWallet((prev) => ({ ...prev, address: accounts[0], isConnected: true }));
        } else {
          // Người dùng chủ động ngắt kết nối
          setWallet({ address: null, isConnected: false, chainId: null });
        }
      };

      // Xử lý khi người dùng chuyển sang mạng khác (vd: từ Ethereum sang Oasis Sapphire)
      const handleChainChanged = (chainIdHex: string) => {
        setWallet((prev) => ({ ...prev, chainId: parseInt(chainIdHex, 16) }));
      };

      // Đăng ký lắng nghe
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Dọn dẹp bộ nhớ khi chuyển trang
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return { wallet, isConnecting, error, connectWallet };
};
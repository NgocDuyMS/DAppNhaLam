import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WalletState } from "@/types";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ 
    isConnected: false, 
    address: "", 
    chainId: 0 
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. HÀM ÉP VÍ TỰ ĐỘNG CHUYỂN SANG OASIS SAPPHIRE TESTNET (Chống Brave Wallet hijack)
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      // Yêu cầu ví chuyển sang mạng có mã 0x5afe (23295 dạng Hex)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x5aff' }],
      });
    } catch (switchError: any) {
      // Nếu ví báo lỗi 4902 (chưa cài mạng Oasis) -> Tự động thêm mạng mới
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x5aff',
                chainName: 'Oasis Sapphire Testnet',
                rpcUrls: ['https://testnet.sapphire.oasis.dev'],
                nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 },
                blockExplorerUrls: ['https://testnet.explorer.sapphire.oasis.dev'],
              },
            ],
          });
        } catch (addError) {
          console.error("Không thể tự động thêm mạng Oasis:", addError);
        }
      }
    }
  };

  // 2. HÀM CỐT LÕI: Đọc và cập nhật trạng thái ví chính xác tuyệt đối
  const updateWalletState = async (provider: ethers.BrowserProvider) => {
    try {
      const accounts = await provider.send("eth_accounts", []);
      
      if (accounts.length > 0) {
        // BÍ KÍP CHỐNG CACHE: Đọc thẳng mã Hex từ tầng sâu nhất của ví
        const chainIdHex = await provider.send("eth_chainId", []);
        const currentChainId = parseInt(chainIdHex, 16); 

        setWallet({
          address: accounts[0],
          isConnected: true,
          chainId: currentChainId,
        });
      } else {
        setWallet({ isConnected: false, address: "", chainId: 0 });
      }
    } catch (err) {
      console.error("Lỗi khi đọc trạng thái ví:", err);
    }
  };

  // 3. AUTO-CONNECT: Tự động giữ kết nối khi ấn F5
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await updateWalletState(provider);
      }
    };
    autoConnect();
  }, []);

  // 4. HÀM KẾT NỐI (Gắn vào nút bấm trên Navbar)
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Vui lòng cài đặt tiện ích ví MetaMask để tiếp tục!");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Mở popup xác nhận ví
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        // Ép ví chuyển đúng mạng trước khi lưu trạng thái
        await switchNetwork(); 
        await updateWalletState(provider);
      }

    } catch (err: any) {
      if (err.code === 4001) {
        setError("Bạn đã từ chối yêu cầu kết nối ví.");
      } else {
        setError(err.message || "Đã xảy ra lỗi khi kết nối ví.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 5. LẮNG NGHE SỰ KIỆN: Đổi mạng / Đổi tài khoản
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = (chainIdHex: string) => {
        console.log("Mạng đã thay đổi thành:", chainIdHex);
        window.location.reload(); 
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet({ isConnected: false, address: "", chainId: 0 });
        } else {
          window.location.reload();
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Dọn dẹp bộ nhớ (Cleanup) khi tắt Component
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return { wallet, isConnecting, error, connectWallet };
}
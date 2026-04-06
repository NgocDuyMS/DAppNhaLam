import { wrapEthersSigner } from '@oasisprotocol/sapphire-ethers-v6';
import { ethers } from "ethers";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import PrivateVotingABI from "./PrivateVotingABI.json"; 


// Dán cái địa chỉ mà Hà vừa deploy thành công ở Phần 1 vào đây
export const CONTRACT_ADDRESS = "0xA8A01315E4719116D89EEC0b23fCa9eebe502A8C"; 

/**
 * Hàm khởi tạo kết nối với Smart Contract
 * @param provider BrowserProvider lấy từ hook useWallet
 * @param isReadOnly Nếu chỉ đọc dữ liệu (không tốn gas) thì truyền true
 */
export const getVotingContract = async (provider: ethers.BrowserProvider, isReadOnly = false) => {
  // Lấy ra phần 'abi' từ file JSON
  const abi = PrivateVotingABI.abi;

  if (isReadOnly) {
    // Nếu chỉ đọc danh sách bầu cử, không cần bọc mã hóa, dùng thẳng provider
    return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  }

  // NẾU LÀ GIAO DỊCH GHI DỮ LIỆU (Tạo bầu cử, Bỏ phiếu):
  // 1. Lấy quyền ký giao dịch từ MetaMask
  const signer = await provider.getSigner();
  
  // 2. MA THUẬT Ở ĐÂY: Bọc cái signer lại bằng thư viện của Sapphire.
  // Từ giờ mọi hàm Contract gọi qua 'sapphireSigner' đều bị mã hóa ngầm.
  const sapphireSigner = wrapEthersSigner(signer);

  // 3. Khởi tạo Contract với Signer đã bọc thép
  return new ethers.Contract(CONTRACT_ADDRESS, abi, sapphireSigner);
};
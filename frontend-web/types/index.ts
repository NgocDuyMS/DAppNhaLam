// Định nghĩa các trạng thái của một cuộc bầu cử
export type ElectionStatus = 'Pending' | 'Active' | 'Ended' | 'Revealed';

// Interface cho Ứng viên
export interface Candidate {
  id: number;
  name: string;
  description?: string; // Dấu ? nghĩa là trường này không bắt buộc phải có
  imageUrl?: string; 
  // voteCount (Số phiếu) được để tùy chọn vì trong giai đoạn bầu cử, 
  // hệ thống sẽ không trả về con số này để chống thao túng kết quả.
  voteCount?: number; 
}

// Interface chính cho Cuộc bầu cử
export interface Election {
  id: number;
  title: string;
  description: string;
  startTime: number; // Lưu dưới dạng Unix Timestamp (giây) để dễ làm việc với Smart Contract
  endTime: number;
  status: ElectionStatus;
  candidates: Candidate[];
  totalVotes: number;
}

// Interface cho Dữ liệu Bỏ phiếu
export interface VotePayload {
  electionId: number;
  candidateId: number;
  // Trường này dành riêng cho Oasis Sapphire: 
  // Lựa chọn của cử tri sẽ được mã hóa thành một chuỗi string trước khi đưa lên chuỗi.
  encryptedData?: string; 
}

// Interface cho Ví người dùng kết nối
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}
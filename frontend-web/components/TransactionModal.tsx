'use client';

// Định nghĩa các trạng thái có thể xảy ra của một giao dịch Web3
export type TxStatus = 'idle' | 'waiting_wallet' | 'mining' | 'success' | 'error';

interface TransactionModalProps {
  isOpen: boolean;
  status: TxStatus;
  message: string;
  txHash?: string; // Mã băm giao dịch để chèn link xem trên Explorer
  onClose: () => void;
}

export default function TransactionModal({ isOpen, status, message, txHash, onClose }: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center">
          {/* TRẠNG THÁI: CHỜ KÝ VÍ HOẶC ĐANG XỬ LÝ (Hiện icon xoay xoay) */}
          {(status === 'waiting_wallet' || status === 'mining') && (
            <div className="relative flex items-center justify-center w-20 h-20 mb-6">
              <svg className="w-16 h-16 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {/* Icon thay đổi tùy trạng thái chờ */}
              <div className="absolute text-2xl">
                {status === 'waiting_wallet' ? '🦊' : '⛓️'}
              </div>
            </div>
          )}

          {/* TRẠNG THÁI: THÀNH CÔNG */}
          {status === 'success' && (
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* TRẠNG THÁI: LỖI */}
          {status === 'error' && (
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-red-100 rounded-full">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          {/* Tiêu đề Modal */}
          <h3 className="mb-2 text-xl font-extrabold text-gray-900">
            {status === 'waiting_wallet' && 'Xác nhận trên MetaMask'}
            {status === 'mining' && 'Đang mã hóa & Gửi lên chuỗi'}
            {status === 'success' && 'Giao dịch Thành công!'}
            {status === 'error' && 'Giao dịch Thất bại'}
          </h3>
          
          {/* Lời nhắn chi tiết */}
          <p className="mb-6 text-gray-600">{message}</p>

          {/* Link xem trên Explorer nếu có mã băm (txHash) */}
          {txHash && status === 'success' && (
            <a 
              href={`https://testnet.explorer.sapphire.oasis.dev/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 mb-6 text-sm font-semibold text-blue-600 transition bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Xem trên Oasis Explorer ↗
            </a>
          )}

          {/* Nút Đóng (Chỉ hiện khi đã xong hoặc lỗi) */}
          {(status === 'success' || status === 'error') && (
            <button
              onClick={onClose}
              className="w-full px-6 py-3 font-bold text-white transition bg-gray-900 rounded-xl hover:bg-gray-800"
            >
              Đóng cửa sổ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
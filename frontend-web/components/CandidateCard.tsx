'use client';

// Định nghĩa các "đầu cắm" (props) để thẻ này nhận dữ liệu từ bên ngoài truyền vào
interface CandidateCardProps {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isSelected?: boolean; // Trạng thái thẻ đang được chọn
  onVote: (id: number) => void; // Hàm được gọi khi bấm nút
}

export default function CandidateCard({ 
  id, 
  name, 
  description, 
  imageUrl, 
  isSelected = false, 
  onVote 
}: CandidateCardProps) {
  return (
    <div 
      className={`flex flex-col h-full p-6 transition-all duration-300 border-2 rounded-2xl shadow-sm hover:shadow-md 
        ${isSelected 
          ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50 transform scale-[1.02]' 
          : 'border-gray-100 bg-white hover:border-blue-200'
        }`}
    >
      {/* Phần Header: Avatar + Tên + ID */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-blue-600 bg-blue-100 rounded-full shrink-0 overflow-hidden border-2 border-white shadow-sm">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="object-cover w-full h-full" />
          ) : (
            // Nếu không có ảnh, lấy chữ cái đầu tiên của tên
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{name}</h3>
          <p className="text-sm font-medium text-gray-500 font-mono mt-0.5">ID: #{id}</p>
        </div>
      </div>

      {/* Phần Body: Mô tả ứng viên */}
      <div className="flex-grow mb-6">
        {description ? (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {description}
          </p>
        ) : (
          <p className="text-sm italic text-gray-400">Không có mô tả thêm.</p>
        )}
      </div>

      {/* Phần Footer: Nút bấm */}
      <button
        onClick={() => onVote(id)}
        className={`w-full py-3 mt-auto text-base font-bold rounded-xl transition-all duration-200 
          ${isSelected 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
      >
        {isSelected ? 'Đang chọn làm đại diện ✓' : 'Bầu chọn'}
      </button>
    </div>
  );
}
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
        <h3 
  className="text-xl font-bold text-gray-900 truncate" 
  title={name} // Mẹo UX: Thêm thuộc tính title để khi di chuột vào, nó hiện ra tên đầy đủ!
>
  {name}
</h3>

<p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
  {description}
</p>
      </div>

      {/* Phần Body: Mô tả ứng viên */}
      <div className="grow mb-6">
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
        className={`w-full py-3 mt-auto text-base font-bold rounded-xl transition-all duration-300 transform active:scale-95 
          ${isSelected 
            ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
            : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent'
          }`}
      >
        {isSelected ? 'Đang chọn làm đại diện ✓' : 'Bầu chọn ngay'}
      </button>
    </div>
  );
}
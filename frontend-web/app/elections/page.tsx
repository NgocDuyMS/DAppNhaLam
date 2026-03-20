import Link from "next/link";
import { Election } from "@/types"; // Import Interface bạn vừa viết ở Ngày 3

// 1. Khai báo mảng dữ liệu giả tuân thủ nghiêm ngặt kiểu Election
const mockElections: Election[] = [
  {
    id: 1,
    title: "Bầu chọn Ban Điều Hành DAO 2026",
    description: "Bỏ phiếu kín chọn ra 3 thành viên cốt cán cho hệ thống quản trị.",
    startTime: Date.now() / 1000,
    endTime: (Date.now() / 1000) + 86400 * 7, // Kết thúc sau 7 ngày
    status: 'Active',
    totalVotes: 0, // Vì đang 'Active' nên phiếu chưa giải mã
    candidates: [
      { id: 101, name: "Alice Phạm" },
      { id: 102, name: "Bob Nguyễn" }
    ]
  },
  {
    id: 2,
    title: "Đề xuất nâng cấp giao thức hệ thống",
    description: "Biểu quyết phân bổ quỹ cho dự án mã nguồn mở.",
    startTime: (Date.now() / 1000) - 86400 * 10,
    endTime: (Date.now() / 1000) - 86400 * 3,
    status: 'Revealed',
    totalVotes: 342, // Đã kết thúc nên được phép hiển thị tổng phiếu
    candidates: []
  }
];

export default function ElectionsListPage() {
  return (
    <div className="max-w-5xl px-8 py-12 mx-auto">
      <div className="flex items-center justify-between pb-6 mb-8 border-b">
        <h1 className="text-3xl font-bold text-gray-800">
          Danh sách Bầu cử
        </h1>
        {/* Nút điều hướng sang trang tạo mới */}
        <Link 
          href="/elections/create"
          className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Tạo cuộc bầu cử
        </Link>
      </div>

      {/* 2. Map qua mảng dữ liệu giả để render giao diện */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {mockElections.map((election) => (
          <div key={election.id} className="p-6 transition-shadow bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{election.title}</h2>
              {/* Đổi màu badge (nhãn) tùy theo trạng thái */}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                election.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {election.status === 'Active' ? 'Đang diễn ra' : 'Đã kết thúc'}
              </span>
            </div>
            
            <p className="mb-6 text-sm text-gray-600 line-clamp-2">
              {election.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="text-sm text-gray-500">
                {/* Áp dụng logic bảo mật của Oasis Sapphire vào UI: 
                  Chỉ hiện kết quả khi đã Revealed (Công bố) 
                */}
                {election.status === 'Revealed' ? (
                  <span className="font-semibold text-blue-600">Tổng phiếu: {election.totalVotes}</span>
                ) : (
                  <span className="italic">Đang mã hóa phiếu...</span>
                )}
              </div>
              
              <Link 
                href={`/elections/${election.id}`}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Xem chi tiết &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
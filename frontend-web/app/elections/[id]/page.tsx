'use client';

import { useState, use } from "react";
import { Election } from "@/types";
import CandidateCard from "@/components/CandidateCard";
// Dữ liệu giả (Hardcode) phục vụ việc test giao diện tĩnh
const mockCandidates = [
  { 
    id: 1, 
    name: "Alice Phạm", 
    description: "Chuyên gia phân tích dữ liệu on-chain với 5 năm kinh nghiệm quản trị DAO.",
    imageUrl: "https://i.pravatar.cc/150?u=alice" // Link ảnh giả lập
  },
  { 
    id: 2, 
    name: "Bob Nguyễn", 
    description: "Nhà phát triển lõi hệ thống bảo mật. Cam kết tối ưu hóa phí gas cho hệ sinh thái.",
    // Cố tình không truyền imageUrl để xem tính năng hiện chữ cái đầu hoạt động không
  },
];

export default function ElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const handleVoteClick = (candidateId: number) => {
    setSelectedCandidateId(candidateId);
  };

  const handleCastVote = () => {
    if (!selectedCandidateId) return;
    alert(`Lá phiếu ẩn danh dành cho ứng viên #${selectedCandidateId} đã sẵn sàng lên chuỗi!`);
  };

  return (
    <div className="max-w-5xl px-8 py-12 mx-auto">
      <div className="pb-6 mb-8 border-b">
        <h1 className="text-3xl font-extrabold text-gray-900">Bầu chọn Ban Điều Hành DAO</h1>
      </div>

      {/* Lưới gọi thẻ Candidate Card */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            id={candidate.id}
            name={candidate.name}
            description={candidate.description}
            imageUrl={candidate.imageUrl}
            isSelected={selectedCandidateId === candidate.id} // Kiểm tra xem thẻ này có đang được chọn không
            onVote={handleVoteClick} // Truyền cái dây cắm nút bấm vào
          />
        ))}
      </div>

      {/* Nút gửi phiếu tổng ở dưới */}
      <div className="p-8 mt-10 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <button
          onClick={handleCastVote}
          disabled={selectedCandidateId === null}
          className="px-10 py-4 text-lg font-bold text-white transition bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg disabled:opacity-50"
        >
          {selectedCandidateId ? "Gửi lá phiếu ẩn danh" : "Vui lòng chọn 1 ứng viên"}
        </button>
      </div>
    </div>
  );
}
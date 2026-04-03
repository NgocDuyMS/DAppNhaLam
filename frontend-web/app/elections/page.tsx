'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { Election } from "@/types";
import PrivateVotingABI from "@/utils/PrivateVotingABI.json";
import { CONTRACT_ADDRESS } from "@/utils/contract";

export default function ElectionsListPage() {
  // State lưu trữ dữ liệu thật từ Blockchain
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm quét dữ liệu từ Smart Contract
  useEffect(() => {
    const fetchElections = async () => {
      try {
        // Sử dụng Public RPC của Oasis để đọc dữ liệu (Không cần MetaMask)
        const provider = new ethers.JsonRpcProvider("https://testnet.sapphire.oasis.dev");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, PrivateVotingABI.abi, provider);

        let fetchedElections: Election[] = [];
        let currentId = 1;
        let keepFetching = true;

        // Vòng lặp lấy từng cuộc bầu cử. 
        // Vì mapping trong Solidity không thể lấy tất cả 1 lần, ta lặp đến khi gặp cuộc bầu cử trống.
        while (keepFetching) {
          const data = await contract.elections(currentId);
          
          // Nếu title trống, nghĩa là đã đọc hết danh sách
          if (!data.title || data.title === "") {
            keepFetching = false;
          } else {
            fetchedElections.push({
              id: Number(data.id),
              title: data.title,
              description: data.description,
              startTime: Number(data.startTime),
              endTime: Number(data.endTime),
              status: data.isRevealed ? 'Revealed' : 'Active',
              candidates: [], // Danh sách ứng viên sẽ được lấy chi tiết ở trang trong
              totalVotes: 0 
            });
            currentId++;
          }
        }

        // Đảo ngược mảng để cuộc bầu cử mới nhất lên đầu
        setElections(fetchedElections.reverse());
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ chuỗi:", error);
      } finally {
        setIsLoading(false); // Tắt hiệu ứng loading
      }
    };

    fetchElections();
  }, []);

  return (
    <div className="max-w-5xl px-8 py-12 mx-auto min-h-[70vh]">
      <div className="flex items-center justify-between pb-6 mb-8 border-b">
        <h1 className="text-3xl font-bold text-gray-800">
          Danh sách Bầu cử (Trực tiếp từ Blockchain)
        </h1>
        <Link 
          href="/elections/create"
          className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Tạo cuộc bầu cử
        </Link>
      </div>

      {/* Hiển thị Skeleton Loading khi đang chờ dữ liệu */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 p-6 bg-gray-100 rounded-xl animate-pulse">
              <div className="w-3/4 h-6 mb-4 bg-gray-200 rounded"></div>
              <div className="w-full h-4 mb-2 bg-gray-200 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : elections.length === 0 ? (
        <div className="py-20 text-center text-gray-500 bg-white border border-dashed rounded-xl border-gray-300">
          Chưa có cuộc bầu cử nào trên hệ thống. Hãy là người đầu tiên tạo!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {elections.map((election) => (
            <div key={election.id} className="p-6 transition-shadow bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{election.title}</h2>
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
                  {election.status === 'Revealed' ? (
                    <span className="font-semibold text-blue-600">Đã công bố</span>
                  ) : (
                    <span className="italic flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Đang mã hóa phiếu
                    </span>
                  )}
                </div>
                
                <Link 
                  href={`/elections/${election.id}`}
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  Tham gia Bầu chọn &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
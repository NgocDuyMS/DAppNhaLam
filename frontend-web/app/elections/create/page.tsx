'use client';

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ethers } from "ethers";

// Import cầu nối Web3 và Component Modal chúng ta đã làm
import { getVotingContract } from "@/utils/contract"; 
import TransactionModal, { TxStatus } from "@/components/TransactionModal";

// 1. Zod Schema (Giữ nguyên như Ngày 9)
const formSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả quá ngắn, hãy viết rõ hơn"),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  candidates: z.array(z.object({ name: z.string().min(1, "Không được để trống") })).min(2, "Cần ít nhất 2 ứng viên"),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu",
  path: ["endTime"]
});

type ElectionFormValues = z.infer<typeof formSchema>;

export default function CreateElectionPage() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ElectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", startTime: "", endTime: "", candidates: [{ name: "" }, { name: "" }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "candidates" });

  // 2. STATE CHO MODAL GIAO DỊCH
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle' as TxStatus,
    message: '',
    txHash: ''
  });

  // 3. HÀM XỬ LÝ GỬI LÊN BLOCKCHAIN (ĐÃ BỌC OASIS SAPPHIRE)
  const onSubmit = async (data: ElectionFormValues) => {
    try {
      // Bật Modal lên, yêu cầu người dùng mở ví
      setModalState({ isOpen: true, status: 'waiting_wallet', message: 'Vui lòng xác nhận giao dịch trên MetaMask của bạn...', txHash: '' });

      if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Khởi tạo Contract (Đã được wrap bởi thư viện SapphireParatime)
      const contract = await getVotingContract(provider, false);

      // Chuyển đổi dữ liệu Form cho khớp với Smart Contract
      const startTimestamp = Math.floor(new Date(data.startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(data.endTime).getTime() / 1000);
      const candidateNames = data.candidates.map(c => c.name);

      // Gọi hàm createElection từ Smart Contract
      const tx = await contract.createElection(
        data.title,
        data.description,
        startTimestamp,
        endTimestamp,
        candidateNames
      );

      // Cập nhật Modal: Chuyển sang trạng thái đang chờ đào block
      setModalState(prev => ({ ...prev, status: 'mining', message: 'Đang mã hóa và gửi dữ liệu lên Oasis Sapphire. Vui lòng chờ vài giây...', txHash: tx.hash }));

      // Chờ mạng lưới xác nhận giao dịch
      await tx.wait();

      // Thành công!
      setModalState(prev => ({ ...prev, status: 'success', message: 'Cuộc bầu cử của bạn đã được khởi tạo an toàn trên chuỗi!' }));

    } catch (error: any) {
      console.error(error);
      // Bắt lỗi nếu người dùng bấm "Từ chối" trên MetaMask
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setModalState({ isOpen: true, status: 'error', message: 'Bạn đã từ chối ký giao dịch.', txHash: '' });
      } else {
        setModalState({ isOpen: true, status: 'error', message: 'Đã xảy ra lỗi khi tương tác với Smart Contract.', txHash: '' });
      }
    }
  };

  return (
    <>
      <div className="max-w-3xl p-8 mx-auto mt-10 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="pb-6 mb-6 border-b">
          <h1 className="text-3xl font-extrabold text-gray-900">Tạo Cuộc Bầu Cử Mới</h1>
        </div>

        {/* Form giao diện tĩnh giữ nguyên */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">Tiêu đề bầu cử</label>
            <input {...register("title")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">Mô tả chi tiết</label>
            <textarea {...register("description")} className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Thời gian bắt đầu</label>
              <input type="datetime-local" {...register("startTime")} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Thời gian kết thúc</label>
              <input type="datetime-local" {...register("endTime")} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700">Danh sách Ứng viên</label>
              <button type="button" onClick={() => append({ name: "" })} className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg">
                + Thêm ứng viên
              </button>
            </div>
            {errors.candidates?.root && <p className="mb-2 text-sm text-red-500">{errors.candidates.root.message}</p>}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex gap-3">
                    <input {...register(`candidates.${index}.name` as const)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" placeholder={`Tên ứng viên số ${index + 1}`} />
                    <button type="button" onClick={() => remove(index)} className="px-4 py-2 font-bold text-red-500 bg-white border border-red-200 rounded-lg">X</button>
                  </div>
                  {errors.candidates?.[index]?.name && <p className="mt-1 text-sm text-red-500">{errors.candidates[index]?.name?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href="/elections" className="px-6 py-2.5 font-semibold text-gray-600">Hủy bỏ</Link>
            <button type="submit" className="px-8 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Khởi tạo Bầu cử
            </button>
          </div>
        </form>
      </div>

      {/* Ráp Modal vào đây */}
      <TransactionModal 
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        txHash={modalState.txHash}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
}
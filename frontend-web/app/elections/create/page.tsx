'use client';

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

// 1. ĐỊNH NGHĨA LUẬT LỆ BẰNG ZOD (Validation Schema)
const formSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả quá ngắn, hãy viết rõ hơn"),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  candidates: z.array(
    z.object({
      name: z.string().min(1, "Tên ứng viên không được để trống")
    })
  ).min(2, "Một cuộc bầu cử hợp lệ phải có ít nhất 2 ứng viên"), // Bắt lỗi số lượng ứng viên cực chuẩn!
}).refine((data) => {
  // Logic kiểm tra: Ngày kết thúc phải sau ngày bắt đầu
  return new Date(data.endTime) > new Date(data.startTime);
}, {
  message: "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu",
  path: ["endTime"]
});

// Lấy kiểu dữ liệu tự động từ Zod Schema thay vì phải tự viết Type như hôm trước
type ElectionFormValues = z.infer<typeof formSchema>;

export default function CreateElectionPage() {
  // 2. TÍCH HỢP ZOD VÀO REACT HOOK FORM
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ElectionFormValues>({
    resolver: zodResolver(formSchema), // Gắn màng lọc vào đây
    defaultValues: {
      title: "", description: "", startTime: "", endTime: "",
      candidates: [{ name: "" }, { name: "" }] 
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "candidates" });

  const onSubmit = async (data: ElectionFormValues) => {
    console.log("Dữ liệu ĐÃ QUA KIỂM DUYỆT an toàn:", data);
    alert("Dữ liệu hợp lệ! Đã sẵn sàng gửi xuống Smart Contract.");
  };

  return (
    <div className="max-w-3xl p-8 mx-auto mt-10 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="pb-6 mb-6 border-b">
        <h1 className="text-3xl font-extrabold text-gray-900">Tạo Cuộc Bầu Cử Mới</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Tiêu đề */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Tiêu đề bầu cử</label>
          <input {...register("title")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          {/* Hiển thị lỗi nếu có */}
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Mô tả chi tiết</label>
          <textarea {...register("description")} className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Thời gian */}
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

        {/* Danh sách ứng viên */}
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

        {/* Nút Submit */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Link href="/elections" className="px-6 py-2.5 font-semibold text-gray-600">Hủy bỏ</Link>
          <button type="submit" className="px-8 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Khởi tạo Bầu cử
          </button>
        </div>
      </form>
    </div>
  );
}
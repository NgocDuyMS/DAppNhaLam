// Trong Next.js 15, params là một Promise nên chúng ta cần khai báo dạng bất đồng bộ (async/await)
export default async function ElectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Chi tiết cuộc bầu cử số: <span className="text-blue-600">#{id}</span>
      </h1>
      <div className="mt-6 p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-700">Khu vực hiển thị Thẻ ứng viên và nút Bỏ phiếu mã hóa.</p>
      </div>
    </div>
  );
}
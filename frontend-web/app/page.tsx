import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      {/* KHU VỰC HERO (Đập ngay vào mắt người dùng) */}
      <main className="flex flex-col items-center px-6 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full shadow-sm">
          Powered by Oasis Sapphire
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
          Nền tảng Quản trị <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Bảo Mật & Phi Tập Trung
          </span>
        </h1>
        
        <p className="max-w-2xl mt-6 text-lg text-gray-600 md:text-xl">
          Dự án <strong>Private Voting dApp</strong> do đội ngũ <strong>dAppNhaLam</strong> kiến tạo[cite: 2, 5]. 
          Giải quyết triệt để "áp lực đồng lứa" và sự thao túng kết quả trong các tổ chức DAO nhờ công nghệ bảo mật thế hệ mới[cite: 14].
        </p>

        {/* NÚT CALL-TO-ACTION (CTA) BẮT MẮT */}
        <div className="flex flex-col gap-4 mt-10 sm:flex-row">
          <Link
            href="/elections"
            className="px-8 py-4 text-lg font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-lg hover:from-blue-700 hover:to-indigo-700"
          >
            Khám phá Bầu cử ngay
          </Link>
          <Link
            href="/elections/create"
            className="px-8 py-4 text-lg font-bold text-gray-700 transition-colors bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300"
          >
            Tạo cuộc bầu cử mới
          </Link>
        </div>
      </main>

      {/* KHU VỰC TÍNH NĂNG NỔI BẬT (Trích xuất từ Báo cáo dự án) */}
      <section className="w-full px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Card Tính năng 1 */}
          <div className="p-8 transition-shadow bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md">
            <div className="w-14 h-14 mb-6 text-blue-600 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Mã hóa đầu cuối</h3>
            <p className="text-gray-600 leading-relaxed">
              Bảo vệ lựa chọn của cử tri ngay từ thời điểm khởi tạo cho đến khi được xử lý bên trong môi trường TEE (Secure Enclave)[cite: 18, 42].
            </p>
          </div>

          {/* Card Tính năng 2 */}
          <div className="p-8 transition-shadow bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md">
            <div className="w-14 h-14 mb-6 text-indigo-600 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl">⚖️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Privacy Lai</h3>
            <p className="text-gray-600 leading-relaxed">
              Bằng chứng bỏ phiếu là công khai để kiểm chứng, nhưng nội dung lá phiếu ẩn danh tuyệt đối[cite: 24].
            </p>
          </div>

          {/* Card Tính năng 3 */}
          <div className="p-8 transition-shadow bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md">
            <div className="w-14 h-14 mb-6 text-purple-600 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Chống Thao Túng</h3>
            <p className="text-gray-600 leading-relaxed">
              Ngăn chặn tình trạng "front-running" và chống MEV, không ai có thể theo dõi xu hướng bỏ phiếu để thay đổi cục diện[cite: 29, 30].
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
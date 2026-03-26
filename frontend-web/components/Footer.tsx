import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto bg-white border-t border-gray-200">
      <div className="flex flex-col items-center justify-between max-w-6xl px-6 mx-auto md:flex-row">
        
        {/* Cột trái: Thông tin dự án */}
        <div className="mb-4 text-center md:text-left md:mb-0">
          <Link href="/" className="text-xl font-bold text-gray-800">
            dAppNhaLam
          </Link>
          <p className="mt-1 text-sm text-gray-500">
            © 2026 Hệ thống quản trị phi tập trung.
          </p>
        </div>

        {/* Cột giữa: Công nghệ */}
        <div className="mb-4 text-center md:text-left md:mb-0">
          <p className="text-sm font-medium text-gray-600">
            Được xây dựng & bảo mật bởi
          </p>
          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Oasis Sapphire Network
          </p>
        </div>

        {/* Cột phải: Liên kết */}
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <Link href="/elections" className="transition hover:text-blue-600">Danh sách Bầu cử</Link>
          <a href="#" className="transition hover:text-blue-600">Github</a>
          <a href="#" className="transition hover:text-blue-600">Báo cáo</a>
        </div>
        
      </div>
    </footer>
  );
}
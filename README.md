# 🗳️ DAppNhaLam - Ứng dụng Bầu Cử Ẩn Danh trên Blockchain

## 📌 Giới thiệu

DAppNhaLam là một ứng dụng bầu cử phi tập trung (Decentralized Application - dApp) cho phép người dùng tạo và tham gia các cuộc bầu cử một cách **minh bạch, bảo mật và ẩn danh**.

Dự án sử dụng công nghệ Blockchain (Oasis Sapphire) để đảm bảo:
- 🔒 Tính riêng tư (Privacy)
- 🧾 Tính minh bạch (Transparency)
- 🚫 Không thể gian lận (Tamper-proof)

---

## 🚀 Công nghệ sử dụng

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend (Smart Contract)
- Solidity
- Hardhat
- Ethers.js

### Blockchain
- Oasis Sapphire Testnet

---

## 📂 Cấu trúc dự án
DAppNhaLam
├── backend-contracts # Smart Contracts (Solidity)
│ ├── contracts
│ ├── scripts
│ ├── test
│ └── hardhat.config.ts
│
└── frontend-web # Giao diện người dùng (Next.js)
├── app
├── components
├── hooks
├── types
└── utils


---

## ⚙️ Cài đặt & Chạy dự án

### 1. Clone project
```bash
git clone <your-repo-url>
cd DAppNhaLam

// Chạy backend ( Smartcontract )
cd backend-contracts

npm install
npx hardhat compile

// chạy frontend 
cd frontend-web

npm install
npm run dev
👉 Truy cập: http://localhost:3000



🔑 Tính năng chính
✅ Tạo cuộc bầu cử
✅ Thêm ứng viên
✅ Bỏ phiếu
🔒 Bỏ phiếu ẩn danh (Oasis Sapphire)
📊 Hiển thị kết quả sau khi kết thúc
💼 Kết nối ví MetaMask


🔄 Luồng hoạt động
Người dùng kết nối ví
Tạo cuộc bầu cử
Thêm ứng viên
Người dùng bỏ phiếu
Dữ liệu được ghi lên Blockchain
Hiển thị kết quả sau khi kết thúc


🧠 Kiến trúc hệ thống
Frontend gọi Smart Contract thông qua Web3 (ethers.js)
Smart Contract xử lý logic và lưu trữ dữ liệu
Oasis Sapphire đảm bảo mã hóa dữ liệu đầu cuối


🧪 Testing
cd backend-contracts
npx hardhat test


📦 Deploy
Frontend có thể deploy bằng:
Vercel
Netlify
Smart Contract deploy bằng:
Hardhat + Oasis Testnet


📸 Demo (tuỳ chọn)
Video demo: 
Website live: 

👥 Thành viên
Ngọc Duy - Frontend + Web3 Integration
Thu Hà - Smart Contract
Tú Nga - UI/UX

📜 License
MIT License


---
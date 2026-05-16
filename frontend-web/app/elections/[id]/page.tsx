"use client";
import ResultsChart from "@/components/ResultsChart";
import { useState, useEffect, use } from "react";
import { ethers } from "ethers";
import CandidateCard from "@/components/CandidateCard";
import TransactionModal, { TxStatus } from "@/components/TransactionModal";
import PrivateVotingABI from "@/utils/PrivateVotingABI.json";
import { CONTRACT_ADDRESS, getVotingContract } from "@/utils/contract";
import { Election, Candidate } from "@/types";
import { auth } from "@/utils/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: any;
  }
}

export default function ElectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const electionId = Number(id);

  // 1. STATE QUẢN LÝ DỮ LIỆU
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // State cho luồng Web2.5 (Xác thực SĐT)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // 2. STATE QUẢN LÝ TƯƠNG TÁC NGƯỜI DÙNG
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "idle" as TxStatus,
    message: "",
    txHash: "",
  });
  // state lưu kết quả chờ xác nhận từ Firebase
  // 2. Hàm thiết lập "Khiên chống Bot" (reCAPTCHA) ,
  // ================luồng FIREBASE OTP================
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible", // Ẩn cái captcha đi cho đẹp UI
        },
      );
    }
  };
  // 3. Hàm Bắn SMS thật
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert("Vui lòng nhập một số điện thoại hợp lệ!");
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      // Định dạng lại số điện thoại chuẩn quốc tế (+84 cho VN)
      const formattedPhone = phoneNumber.startsWith("0")
        ? "+84" + phoneNumber.slice(1)
        : "+" + phoneNumber.replace(/[^0-9]/g, "");

      alert(`Đang gửi SMS thật đến ${formattedPhone}... Vui lòng đợi.`);

      // Yêu cầu Firebase bắn SMS
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier,
      );
      // Lưu kết quả lại để lát nữa kiểm tra
      setConfirmationResult(result);
      setIsOtpSent(true);
    } catch (error: any) {
      console.error("Lỗi gửi SMS:", error);
      alert(
        "Gửi SMS thất bại. Hãy kiểm tra lại định dạng số điện thoại hoặc reCAPTCHA.",
      );
      // Xóa captcha bị lỗi để thử lại
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  // 4. Hàm Kiểm tra mã OTP khách nhập vào
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) return;

    try {
      // Đưa mã khách gõ cho Firebase đối chiếu
      await confirmationResult.confirm(otp);

      setIsOtpVerified(true);
      alert("Tuyệt vời! Số điện thoại đã được xác thực hoàn toàn.");
    } catch (error) {
      alert("Mã OTP không chính xác hoặc đã hết hạn, vui lòng thử lại.");
    }
  };

  // 3. API ĐỌC DỮ LIỆU TỪ BLOCKCHAIN (Miễn phí Gas)
  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          "https://testnet.sapphire.oasis.dev",
        );
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          PrivateVotingABI.abi,
          provider,
        );

        // A. Lấy thông tin cuộc bầu cử
        const data = await contract.elections(electionId);

        // Nếu không có title, nghĩa là ID bầu cử không tồn tại
        if (!data.title || data.title === "") {
          setIsLoading(false);
          return;
        }

        setElection({
          id: Number(data.id),
          title: data.title,
          description: data.description,
          startTime: Number(data.startTime),
          endTime: Number(data.endTime),
          status: data.isRevealed ? "Revealed" : "Active",
          candidates: [],
          totalVotes: 0,
        });

        // B. Lấy danh sách ứng viên (Chỉ lấy ID và Tên nhờ cơ chế giấu phiếu của TEE)
        // B. Lấy danh sách ứng viên (Chỉ lấy ID và Tên)
        const [candIds, candNames] = await contract.getCandidates(electionId);

        let formattedCandidates: Candidate[] = candIds.map(
          (cId: any, index: number) => ({
            id: Number(cId),
            name: candNames[index],
            voteCount: 0, // Mặc định là 0 khi chưa Reveal
          }),
        );

        // C. NẾU ĐÃ CÔNG BỐ KẾT QUẢ -> Gọi thêm API lấy số phiếu
        if (data.isRevealed) {
          const [resIds, resVotes] = await contract.getResults(electionId);
          // Ghép số phiếu vào danh sách ứng viên
          formattedCandidates = formattedCandidates.map((cand) => {
            const voteIndex = resIds.findIndex(
              (id: any) => Number(id) === cand.id,
            );
            return {
              ...cand,
              voteCount: voteIndex !== -1 ? Number(resVotes[voteIndex]) : 0,
            };
          });

          // Tính tổng số phiếu của cả cuộc bầu cử
          const total = formattedCandidates.reduce(
            (sum, current) => sum + current.voteCount!,
            0,
          );
          setElection((prev) => (prev ? { ...prev, totalVotes: total } : null));
        }

        setCandidates(formattedCandidates);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết bầu cử:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId]);

  // 4. API GHI LÁ PHIẾU LÊN BLOCKCHAIN (Tốn Gas - Cần Oasis Sapphire Wrap)
  const handleCastVote = async () => {
    if (!selectedCandidateId) return;
    // yêu cầu nhập sdt trước khi vote
    if (!phoneNumber || phoneNumber.length < 9) {
      alert("Vui lòng nhập số điện thoại hợp lệ để xác thực!");
      return;
    }
    try {
      setModalState({
        isOpen: true,
        status: "waiting_wallet",
        message: "Mở MetaMask để ký lá phiếu mã hóa của bạn...",
        txHash: "",
      });

      if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask!");
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Khởi tạo cầu nối ĐÃ BỌC MÃ HÓA của Oasis Sapphire
      const contract = await getVotingContract(provider, false);

      // 1. Chuẩn hóa số điện thoại (Xóa khoảng trắng, dấu cộng...)
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");

      // 2. Thêm một "Muối" (Salt) bí mật để chống dò ngược (Ví dụ: tên dApp)
      const dataToHash = "dAppNhaLam_Secret_" + cleanPhone;

      // 3. Băm dữ liệu bằng keccak256
      const phoneHash = ethers.keccak256(ethers.toUtf8Bytes(dataToHash));
      console.log("Dữ liệu gửi lên chuỗi:", phoneHash);

      // Gọi hàm castVote trên Smart Contract
      // Lưu ý: selectedCandidateId sẽ được thư viện tự động mã hóa trước khi đi
      const tx = await contract.castVote(
        electionId,
        selectedCandidateId,
        phoneHash,
      );

      setModalState((prev) => ({
        ...prev,
        status: "mining",
        message: "Đang ghi nhận lá phiếu ẩn danh...",
        txHash: tx.hash,
      }));

      await tx.wait();

      setModalState((prev) => ({
        ...prev,
        status: "success",
        message: "Thành Công! Lá phiếu ẩn danh của bạn đã được ghi nhận.",
      }));
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.reason || error.message || "Lỗi không xác định.";
      // Hiển thị lỗi từ Smart Contract (VD: "Ban da bo phieu cho cuoc bau cu nay roi")
      setModalState({
        isOpen: true,
        status: "error",
        message: errorMsg,
        txHash: "",
      });
    }
  };
  // Hàm mở khóa kết quả (Chỉ gọi được khi đã qua thời gian endTime)
  const handleReveal = async () => {
    try {
      setModalState({
        isOpen: true,
        status: "waiting_wallet",
        message: "Ký xác nhận để yêu cầu TEE giải mã kết quả...",
        txHash: "",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getVotingContract(provider, false);

      // Gọi hàm tallyVotes của Hà
      const tx = await contract.tallyVotes(electionId);

      setModalState((prev) => ({
        ...prev,
        status: "mining",
        message: "Hệ thống đang giải mã và công khai số phiếu...",
        txHash: tx.hash,
      }));

      await tx.wait();

      setModalState((prev) => ({
        ...prev,
        status: "success",
        message: "Tuyệt vời! Kết quả đã được công bố minh bạch trên mạng lưới.",
      }));

      // Reload lại trang sau 2 giây để web cập nhật số liệu mới
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.reason || error.message || "Lỗi không xác định.";
      // Nếu chưa hết giờ mà cố bấm, Contract của Hà sẽ quăng lỗi chặn lại ngay
      setModalState({
        isOpen: true,
        status: "error",
        message: errorMsg,
        txHash: "",
      });
    }
  };

  // Nếu đang tải dữ liệu
  if (isLoading)
    return (
      <div className="py-20 text-xl font-bold text-center text-gray-500 animate-pulse">
        Đang đồng bộ dữ liệu TEE...
      </div>
    );

  // Nếu ID sai hoặc không tồn tại
  if (!election)
    return (
      <div className="py-20 text-xl text-center text-red-500">
        Không tìm thấy cuộc bầu cử này trên chuỗi!
      </div>
    );

  return (
    <>
      <div className="max-w-5xl px-8 py-12 mx-auto">
        <div className="pb-6 mb-8 border-b">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {election.title}
          </h1>
          <p className="mt-4 text-gray-600">{election.description}</p>
          <div className="flex gap-4 mt-4">
            <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
              Trạng thái:{" "}
              {election.status === "Active" ? "Đang bỏ phiếu" : "Đã kết thúc"}
            </span>
            <span className="px-3 py-1 font-mono text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
              ID Bầu cử: #{election.id}
            </span>
          </div>
        </div>

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          {election.status === "Active"
            ? "Chọn 1 ứng viên để bầu:"
            : "Danh sách ứng viên:"}
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-h-150 overflow-y-auto p-2 -mx-2 custom-scrollbar">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              id={candidate.id}
              name={candidate.name}
              isSelected={selectedCandidateId === candidate.id}
              onVote={(id) => setSelectedCandidateId(id)}
            />
          ))}
        </div>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        txHash={modalState.txHash}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />

      {/* Nút bấm thay đổi tùy theo trạng thái */}

      {/* Trường hợp 1: Đang Active -> Hiện nút Bỏ Phiếu */}
      {election.status === "Active" && (
        <div className="p-8 mt-10 text-center bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          {/* KHU VỰC 1: XÁC THỰC WEB2.5 (Chỉ hiện khi chưa xác thực xong) */}
          {!isOtpVerified && (
            <div className="max-w-md mx-auto mb-8 text-left p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center rounded-full text-sm">
                  1
                </span>
                Xác thực Cử tri
              </h4>

              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Số điện thoại di động
              </label>
              <div id="recaptcha-container"></div>
              <div className="flex gap-2 mb-4">
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isOtpSent}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {!isOtpSent ? (
                  <button
                    onClick={handleSendOTP}
                    className="px-4 py-2 font-semibold text-white bg-gray-800 rounded-lg hover:bg-black transition"
                  >
                    Gửi mã
                  </button>
                ) : (
                  <button
                    onClick={() => setIsOtpSent(false)}
                    className="px-4 py-2 font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Sửa số
                  </button>
                )}
              </div>

              {/* Ô nhập OTP hiện ra sau khi bấm Gửi mã */}
              {isOtpSent && (
                <div className="animate-fade-in-up">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Nhập mã OTP 6 số
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono font-bold"
                    />
                    <button
                      onClick={handleVerifyOTP}
                      className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KHU VỰC 2: KÝ GIAO DỊCH WEB3 (Chỉ hiện khi OTP đã đúng) */}
          {isOtpVerified && (
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Đã xác thực định danh (Chuẩn bị băm dữ liệu)
              </div>
              <br />
              <button
                onClick={handleCastVote}
                disabled={selectedCandidateId === null}
                className="px-10 py-4 text-lg font-bold text-white transition bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCandidateId
                  ? "Ký và Gửi lá phiếu ẩn danh"
                  : "Vui lòng chọn 1 ứng viên"}
              </button>
              <p className="mt-4 text-xs text-gray-500 max-w-sm mx-auto">
                Lá phiếu của bạn sẽ được niêm phong bởi Smart Contract. Mọi
                thông tin định danh sẽ bị băm (Hash) thành chuỗi không thể đọc
                ngược.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trường hợp 2: Hết giờ nhưng CHƯA Reveal -> Hiện nút yêu cầu Giải mã */}
      {/* (Trong thực tế bạn nên so sánh election.endTime với thời gian hiện tại Date.now() / 1000) */}
      {election.status === "Active" && Date.now() / 1000 > election.endTime && (
        <div className="p-8 mt-10 text-center bg-yellow-50 rounded-2xl border border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-800 mb-2">
            Cuộc bầu cử đã kết thúc!
          </h3>
          <p className="mb-4 text-yellow-700">
            Dữ liệu vẫn đang bị khóa. Hãy kích hoạt quá trình công bố kết quả.
          </p>
          <button
            onClick={handleReveal}
            className="px-8 py-3 font-bold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
          >
            Giải mã & Công bố Kết quả 🔓
          </button>
        </div>
      )}

      {/* Trường hợp 3: ĐÃ Reveal -> Hiện Bảng vàng tổng kết */}
      {election.status === "Revealed" && (
        <div className="p-8 mt-10 bg-green-50 rounded-2xl border border-green-200 text-center">
          <h3 className="text-2xl font-black text-green-800 mb-2">
            KẾT QUẢ ĐÃ ĐƯỢC CÔNG BỐ
          </h3>
          <p className="text-green-700 font-medium">
            Tổng số phiếu hợp lệ:{" "}
            <span className="text-2xl font-bold">{election.totalVotes}</span>
          </p>

          {/* Hiện số phiếu ngay dưới tên các ứng viên */}
          <div className="mt-6 flex flex-col gap-3 max-w-md mx-auto">
            {candidates
              .sort((a, b) => b.voteCount! - a.voteCount!)
              .map((cand, idx) => (
                <div
                  key={cand.id}
                  className="flex justify-between items-center p-4 bg-white rounded-lg border shadow-sm"
                >
                  <span className="font-bold text-gray-800">
                    {idx + 1}. {cand.name}
                  </span>
                  <span className="font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {cand.voteCount} phiếu
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-10">
            <h3 className="text-2xl font-black text-center text-gray-900 mb-8">
              PHÂN TÍCH KẾT QUẢ
            </h3>
            <ResultsChart
              data={candidates.map((c) => ({
                name: c.name,
                votes: c.voteCount || 0,
              }))}
            />
          </div>
        </div>
      )}
    </>
  );
}

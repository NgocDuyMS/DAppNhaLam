import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PrivateVoting Smart Contract", function () {
  // Khai báo các biến dùng chung cho toàn bộ kịch bản test
  let privateVoting: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let electionId = 1;

  // Chạy trước mỗi test case: Triển khai lại contract mới tinh
  beforeEach(async function () {
    // Lấy danh sách các tài khoản giả lập từ Hardhat
    [owner, addr1, addr2] = await ethers.getSigners();

    // Triển khai Contract
    const PrivateVoting = await ethers.getContractFactory("PrivateVoting");
    privateVoting = await PrivateVoting.deploy();
  });

  describe("1. Khởi tạo Bầu cử", function () {
    it("Phải tạo được cuộc bầu cử và lưu đúng thông tin công khai", async function () {
      const startTime = await time.latest() + 60; // Bắt đầu sau 1 phút
      const endTime = startTime + 86400; // Kết thúc sau 1 ngày

      // Giả lập giao dịch tạo bầu cử
      await expect(privateVoting.createElection(
        "Bầu chọn Ban Điều Hành",
        "Mô tả test",
        startTime,
        endTime,
        ["Alice", "Bob"]
      )).to.emit(privateVoting, "ElectionCreated");

      // Kiểm tra dữ liệu được lưu
      const election = await privateVoting.elections(electionId);
      expect(election.title).to.equal("Bầu chọn Ban Điều Hành");
      expect(election.isRevealed).to.equal(false);
    });
  });

  describe("2. Luồng Bỏ phiếu & Chống gian lận", function () {
    let startTime: number, endTime: number;

    beforeEach(async function () {
      startTime = await time.latest() + 60;
      endTime = startTime + 86400;
      await privateVoting.createElection("Test Vote", "Mô tả", startTime, endTime, ["Alice", "Bob"]);
      
      // Tua nhanh thời gian đến lúc bầu cử bắt đầu
      await time.increaseTo(startTime + 10);
    });

    it("Cho phép người dùng vote hợp lệ và phát ra sự kiện", async function () {
      // addr1 bầu cho ứng viên số 1 (Alice)
      await expect(privateVoting.connect(addr1).castVote(electionId, 1))
        .to.emit(privateVoting, "VoteCasted")
        .withArgs(electionId, addr1.address);
    });

    it("Ngăn chặn một người vote 2 lần (Double-voting)", async function () {
      await privateVoting.connect(addr1).castVote(electionId, 1);
      
      // Thử vote lần nữa bằng chính ví đó -> Phải bị chặn lại
      await expect(
        privateVoting.connect(addr1).castVote(electionId, 2)
      ).to.be.revertedWith("Ban da bo phieu cho cuoc bau cu nay roi");
    });
  });

  describe("3. Cơ chế Công bố (Reveal Phase) & Bảo mật TEE", function () {
    let startTime: number, endTime: number;

    beforeEach(async function () {
      startTime = await time.latest() + 60;
      endTime = startTime + 86400;
      await privateVoting.createElection("Test Reveal", "Mô tả", startTime, endTime, ["Alice", "Bob"]);
      
      await time.increaseTo(startTime + 10);
      
      // 2 người cùng bầu cho ứng viên số 1
      await privateVoting.connect(addr1).castVote(electionId, 1);
      await privateVoting.connect(addr2).castVote(electionId, 1);
    });

    it("KHÔNG cho phép xem kết quả khi chưa hết hạn và chưa giải mã", async function () {
      await expect(
        privateVoting.getResults(electionId)
      ).to.be.revertedWith("Ket qua van dang duoc ma hoa trong TEE!");
    });

    it("Chỉ cho phép gọi hàm tallyVotes khi đã hết thời gian", async function () {
      // Thử gọi khi chưa hết giờ -> Bị chặn
      await expect(
        privateVoting.tallyVotes(electionId)
      ).to.be.revertedWith("Cuoc bau cu chua ket thuc, khong the giai ma!");

      // Tua nhanh thời gian vượt qua endTime
      await time.increaseTo(endTime + 10);

      // Gọi lại -> Thành công và phát ra sự kiện
      await expect(privateVoting.tallyVotes(electionId))
        .to.emit(privateVoting, "ElectionRevealed")
        .withArgs(electionId, 2); // Tổng cộng có 2 phiếu
    });

    it("Sau khi Reveal, getResults phải trả về đúng số phiếu đã cộng dồn", async function () {
      await time.increaseTo(endTime + 10);
      await privateVoting.tallyVotes(electionId);

      const [ids, voteCounts] = await privateVoting.getResults(electionId);
      
      // Kiểm tra ứng viên 1 (Alice) có 2 phiếu
      expect(voteCounts[0]).to.equal(2);
      // Kiểm tra ứng viên 2 (Bob) có 0 phiếu
      expect(voteCounts[1]).to.equal(0);
    });
  });
});
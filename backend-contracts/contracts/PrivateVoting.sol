// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PrivateVoting {
    // 1. ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU (Khớp với types/index.ts trên Frontend)

    struct Candidate {
        uint256 id;
        string name;
        // Lưu ý: Biến này sẽ được tính toán ngầm trong "hộp đen" TEE
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isRevealed; // Trạng thái Công bố kết quả
        address creator;
    }

    // 2. BIẾN TRẠNG THÁI (STATE VARIABLES)
    uint256 private _nextElectionId = 1;

    // Mapping lưu thông tin cuộc bầu cử (Công khai để Frontend đọc được danh sách)
    mapping(uint256 => Election) public elections;

    // Mapping lưu danh sách ứng viên (ĐỂ PRIVATE).
    // Nếu để public, ai cũng có thể gọi hàm xem được voteCount trước khi kết thúc!
    mapping(uint256 => Candidate[]) private electionCandidates;

    // Event để ghi nhận bằng chứng khởi tạo trên sổ cái công khai
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    // Biến private để lưu vết người dùng đã vote chưa: mapping(electionId => mapping(voterAddress => bool))
    // Để private để không ai có thể query toàn bộ danh sách cử tri một cách dễ dàng.
    mapping(uint256 => mapping(address => bool)) private hasVoted;

    // Sự kiện báo hiệu có người bỏ phiếu (Phục vụ cho tính "Minh bạch")
    // Tuyệt đối KHÔNG có biến candidateId ở đây để bảo mật "Nội dung"
    event VoteCasted(uint256 indexed electionId, address indexed voter);
    // 3. HÀM KHỞI TẠO CUỘC BẦU CỬ CẤU HÌNH CAO
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _candidateNames
    ) public returns (uint256) {
        // Kiểm tra điều kiện đầu vào
        require(
            _endTime > _startTime,
            "Thoi gian ket thuc phai sau thoi gian bat dau"
        );
        require(
            _candidateNames.length >= 2,
            "Can it nhat 2 ung vien de bau cu"
        );

        uint256 electionId = _nextElectionId;

        // Lưu thông tin siêu dữ liệu (Metadata)
        elections[electionId] = Election({
            id: electionId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isRevealed: false,
            creator: msg.sender
        });

        // Khởi tạo danh sách ứng viên với số phiếu ban đầu là 0
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            electionCandidates[electionId].push(
                Candidate({id: i + 1, name: _candidateNames[i], voteCount: 0})
            );
        }

        _nextElectionId++;

        // Phát ra sự kiện (Event) để Frontend có thể lắng nghe
        emit ElectionCreated(electionId, _title, _startTime, _endTime);

        return electionId;
    }

    // Hàm phụ trợ để Frontend lấy danh sách ứng viên (Nhưng giấu số phiếu)
    function getCandidates(
        uint256 _electionId
    ) public view returns (uint256[] memory ids, string[] memory names) {
        uint256 count = electionCandidates[_electionId].length;
        ids = new uint256[](count);
        names = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            ids[i] = electionCandidates[_electionId][i].id;
            names[i] = electionCandidates[_electionId][i].name;
            // TUYỆT ĐỐI KHÔNG TRẢ VỀ voteCount Ở ĐÂY
        }

        return (ids, names);
    }

    // 4. HÀM BỎ PHIẾU ẨN DANH (Nhiệm vụ Ngày 8-9 của Hà)
    function castVote(uint256 _electionId, uint256 _candidateId) public {
        // Lấy thông tin cuộc bầu cử từ storage
        Election storage election = elections[_electionId];

        // --- BƯỚC 1: KIỂM TRA TÍNH HỢP LỆ (VALIDATION) ---
        require(
            block.timestamp >= election.startTime,
            "Cuoc bau cu chua bat dau"
        );
        require(block.timestamp <= election.endTime, "Cuoc bau cu da ket thuc");
        require(
            !hasVoted[_electionId][msg.sender],
            "Ban da bo phieu cho cuoc bau cu nay roi"
        );
        require(
            !election.isRevealed,
            "Cuoc bau cu nay da duoc cong bo ket qua"
        );

        // --- BƯỚC 2: TÌM ỨNG VIÊN VÀ CỘNG PHIẾU ---
        bool validCandidate = false;
        uint256 candidateCount = electionCandidates[_electionId].length;

        for (uint256 i = 0; i < candidateCount; i++) {
            if (electionCandidates[_electionId][i].id == _candidateId) {
                // Ma thuật của Oasis Sapphire nằm ở đây:
                // Việc cộng phiếu này diễn ra bên trong "hộp đen" TEE.
                electionCandidates[_electionId][i].voteCount++;
                validCandidate = true;
                break;
            }
        }

        require(validCandidate, "Ung vien khong ton tai");

        // --- BƯỚC 3: ĐÁNH DẤU & PHÁT SỰ KIỆN ---
        // Ghi nhận ví này đã vote để chống double-voting
        hasVoted[_electionId][msg.sender] = true;

        // Bắn sự kiện lên chuỗi để Frontend có thể hiển thị thông báo thành công
        emit VoteCasted(_electionId, msg.sender);
    }

    // Sự kiện báo hiệu kết quả đã được giải mã và công bố
    event ElectionRevealed(uint256 indexed electionId, uint256 totalVotes);

    // 5. HÀM CÔNG BỐ KẾT QUẢ (Reveal Phase - Ngày 10)
    // Bất kỳ ai cũng có thể gọi hàm này (vd: người tạo bầu cử, hoặc một bot tự động),
    // nhưng nó CHỈ chạy thành công khi thời gian đã hết.
    function tallyVotes(uint256 _electionId) public {
        Election storage election = elections[_electionId];

        // --- CHỐT CHẶN BẢO MẬT ---
        require(
            block.timestamp > election.endTime,
            "Cuoc bau cu chua ket thuc, khong the giai ma!"
        );
        require(!election.isRevealed, "Ket qua da duoc cong bo roi!");

        // Mở khóa: Chuyển trạng thái sang Đã Công Bố
        election.isRevealed = true;

        // Tính tổng số phiếu để phát sự kiện (Frontend sẽ dùng số này để hiển thị)
        uint256 totalVotes = 0;
        uint256 candidateCount = electionCandidates[_electionId].length;

        for (uint256 i = 0; i < candidateCount; i++) {
            totalVotes += electionCandidates[_electionId][i].voteCount;
        }

        // Bắn sự kiện lên chuỗi
        emit ElectionRevealed(_electionId, totalVotes);
    }

    // 6. HÀM LẤY KẾT QUẢ CUỐI CÙNG (Ngày 11)
    // Frontend sẽ gọi hàm này để vẽ biểu đồ/hiển thị người chiến thắng.
    function getResults(
        uint256 _electionId
    ) public view returns (uint256[] memory ids, uint256[] memory voteCounts) {
        Election storage election = elections[_electionId];

        // BẢO MẬT LỚP 2: Trả về lỗi ngay lập tức nếu có người cố tình đọc số phiếu khi chưa Reveal
        require(election.isRevealed, "Ket qua van dang duoc ma hoa trong TEE!");

        uint256 count = electionCandidates[_electionId].length;
        ids = new uint256[](count);
        voteCounts = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            ids[i] = electionCandidates[_electionId][i].id;
            // Lúc này, biến voteCount mới chính thức được phép "chui" ra khỏi hộp đen TEE
            voteCounts[i] = electionCandidates[_electionId][i].voteCount;
        }

        return (ids, voteCounts);
    }
}

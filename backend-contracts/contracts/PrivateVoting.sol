// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PrivateVoting {

    //mỗi election có list candidate riêng
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    // luu danh sach cac cuoc bau cu 
    struct Election {
        uint id;
        string title;
        bool isActive;
        uint candidateCount;
    }

    uint public electionCount;

    mapping(uint => Election) public elections;
    mapping(uint => mapping(uint => Candidate)) public candidates;

    function createElection(string memory _title) public {
        electionCount++;

        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            isActive: true,
            candidateCount: 0
        });
    }
}
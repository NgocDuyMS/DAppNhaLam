import { ethers } from "hardhat";

async function main() {
  console.log("Đang đưa PrivateVoting lên Oasis Sapphire Testnet...");
  const privateVoting = await ethers.deployContract("PrivateVoting");
  await privateVoting.waitForDeployment();
  console.log(`✅ Thành công! Địa chỉ Contract của Hà là: ${privateVoting.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
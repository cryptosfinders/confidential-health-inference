const hre = require("hardhat");

async function main() {
  const Health = await hre.ethers.getContractFactory("HealthInference");
  const contract = await Health.deploy("0x0000000000000000000000000000000000000000"); // replace gateway addr
  await contract.deployed();
  console.log("HealthInference deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

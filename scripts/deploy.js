const hre = require("hardhat");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Replace with your real gateway address if needed
  const gatewayAddr = "0x0000000000000000000000000000000000000000";

  // Get contract factory (connect to signer explicitly)
  const Health = await hre.ethers.getContractFactory("HealthInference", deployer);

  // Deploy
  const contract = await Health.deploy(gatewayAddr);
  console.log("Deployment tx:", contract.deploymentTransaction().hash);

  // Wait for it to be mined
  await contract.waitForDeployment();

  // Print deployed address
  console.log("✅ HealthInference deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



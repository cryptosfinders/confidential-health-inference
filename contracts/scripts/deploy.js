async function main() {
  const HealthInference = await ethers.getContractFactory("HealthInference");
  
  // ⚠️ IMPORTANT: pass gateway address argument
  const gatewayAddress = "0x0000000000000000000000000000000000000000"; // replace
  
  const contract = await HealthInference.deploy(gatewayAddress);

  await contract.waitForDeployment();
  console.log("HealthInference deployed at: ", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting PaymentProcessor deployment to Sepolia...");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH");
    process.exit(1);
  }
  
  // Contract configuration
  const PYUSD_TOKEN_ADDRESS = process.env.PYUSD_TOKEN_ADDRESS || "0xf290590D47c81820427A108Ce6363607a03Aaf1b";
  const FEE_RECIPIENT_ADDRESS = process.env.FEE_RECIPIENT_ADDRESS || deployer.address;
  
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  console.log("Fee Recipient Address:", FEE_RECIPIENT_ADDRESS);
  
  // Deploy PaymentProcessor
  console.log("\n📄 Deploying PaymentProcessor...");
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  
  const paymentProcessor = await PaymentProcessor.deploy(
    PYUSD_TOKEN_ADDRESS,
    FEE_RECIPIENT_ADDRESS
  );
  
  console.log("⏳ Waiting for deployment transaction...");
  await paymentProcessor.waitForDeployment();
  
  const contractAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", contractAddress);
  
  // Wait for a few confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    pyusdTokenAddress: PYUSD_TOKEN_ADDRESS,
    feeRecipientAddress: FEE_RECIPIENT_ADDRESS,
    deployerAddress: deployer.address,
    network: hre.network.name,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    transactionHash: paymentProcessor.deploymentTransaction().hash
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Contract Address:", contractAddress);
  console.log("📄 Transaction Hash:", paymentProcessor.deploymentTransaction().hash);
  console.log("📄 Deployment info saved to: deployment-info.json");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress} "${PYUSD_TOKEN_ADDRESS}" "${FEE_RECIPIENT_ADDRESS}"`);
  console.log("2. Register restaurants using the contract");
  console.log("3. Update frontend with the new contract address");
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log(`\n✅ Deployment successful: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
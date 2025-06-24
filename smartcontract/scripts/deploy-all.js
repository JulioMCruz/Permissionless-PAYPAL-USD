const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting comprehensive deployment to Sepolia...");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.02")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.02 ETH");
    process.exit(1);
  }
  
  // Contract configuration
  const PYUSD_TOKEN_ADDRESS = process.env.PYUSD_TOKEN_ADDRESS || "0xf290590D47c81820427A108Ce6363607a03Aaf1b";
  const FEE_RECIPIENT_ADDRESS = process.env.FEE_RECIPIENT_ADDRESS || deployer.address;
  const BASE_IMAGE_URI = process.env.BASE_IMAGE_URI || "https://api.restaurant-nft.com/images/";
  
  console.log("PYUSD Token Address:", PYUSD_TOKEN_ADDRESS);
  console.log("Fee Recipient Address:", FEE_RECIPIENT_ADDRESS);
  console.log("Base Image URI:", BASE_IMAGE_URI);
  
  const deploymentResults = {};
  
  // Deploy PaymentProcessor
  console.log("\n📄 Deploying PaymentProcessor...");
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  
  const paymentProcessor = await PaymentProcessor.deploy(
    PYUSD_TOKEN_ADDRESS,
    FEE_RECIPIENT_ADDRESS
  );
  
  console.log("⏳ Waiting for PaymentProcessor deployment...");
  await paymentProcessor.waitForDeployment();
  
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", paymentProcessorAddress);
  
  deploymentResults.paymentProcessor = {
    address: paymentProcessorAddress,
    transactionHash: paymentProcessor.deploymentTransaction().hash
  };
  
  // Deploy ReviewNFT
  console.log("\n🎨 Deploying ReviewNFT...");
  const ReviewNFT = await hre.ethers.getContractFactory("ReviewNFT");
  
  const reviewNFT = await ReviewNFT.deploy(
    paymentProcessorAddress, // Payment processor as authorized creator
    BASE_IMAGE_URI
  );
  
  console.log("⏳ Waiting for ReviewNFT deployment...");
  await reviewNFT.waitForDeployment();
  
  const reviewNFTAddress = await reviewNFT.getAddress();
  console.log("✅ ReviewNFT deployed to:", reviewNFTAddress);
  
  deploymentResults.reviewNFT = {
    address: reviewNFTAddress,
    transactionHash: reviewNFT.deploymentTransaction().hash
  };
  
  // Wait for confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  // Save comprehensive deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasPrice: (await hre.ethers.provider.getFeeData()).gasPrice?.toString(),
    
    // Contract addresses
    contracts: {
      paymentProcessor: {
        address: paymentProcessorAddress,
        name: "PaymentProcessor",
        transactionHash: deploymentResults.paymentProcessor.transactionHash,
        constructorArgs: [PYUSD_TOKEN_ADDRESS, FEE_RECIPIENT_ADDRESS]
      },
      reviewNFT: {
        address: reviewNFTAddress,
        name: "ReviewNFT", 
        transactionHash: deploymentResults.reviewNFT.transactionHash,
        constructorArgs: [paymentProcessorAddress, BASE_IMAGE_URI]
      }
    },
    
    // Configuration
    config: {
      pyusdTokenAddress: PYUSD_TOKEN_ADDRESS,
      feeRecipientAddress: FEE_RECIPIENT_ADDRESS,
      baseImageURI: BASE_IMAGE_URI
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 All contracts deployed successfully!");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│                   CONTRACT ADDRESSES                   │");
  console.log("├─────────────────────────────────────────────────────────┤");
  console.log(`│ PaymentProcessor: ${paymentProcessorAddress}  │`);
  console.log(`│ ReviewNFT:        ${reviewNFTAddress}  │`);
  console.log("└─────────────────────────────────────────────────────────┘");
  
  console.log("\n📄 Deployment info saved to: deployment-info.json");
  
  console.log("\n📋 Verification Commands:");
  console.log(`npx hardhat verify --network sepolia ${paymentProcessorAddress} "${PYUSD_TOKEN_ADDRESS}" "${FEE_RECIPIENT_ADDRESS}"`);
  console.log(`npx hardhat verify --network sepolia ${reviewNFTAddress} "${paymentProcessorAddress}" "${BASE_IMAGE_URI}"`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify both contracts on Etherscan");
  console.log("2. Register restaurants using PaymentProcessor");
  console.log("3. Update frontend with contract addresses");
  console.log("4. Test the review creation flow");
  
  return {
    paymentProcessor: paymentProcessorAddress,
    reviewNFT: reviewNFTAddress
  };
}

main()
  .then((addresses) => {
    console.log(`\n✅ Deployment completed successfully!`);
    console.log(`PaymentProcessor: ${addresses.paymentProcessor}`);
    console.log(`ReviewNFT: ${addresses.reviewNFT}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
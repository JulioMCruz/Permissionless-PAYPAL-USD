const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // Load deployment info
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  } catch (error) {
    console.error("❌ Could not load deployment info. Run deploy script first.");
    process.exit(1);
  }
  
  console.log("🏪 Registering restaurants...");
  
  // Get contract instance
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = PaymentProcessor.attach(deploymentInfo.contractAddress);
  
  // Sample restaurants to register
  const restaurants = [
    {
      name: "The Modern SoHo",
      address: "0x742E48F3c62Ee6e6cD7C8AB24b6eFBf5e1C58267" // Replace with actual restaurant wallet
    },
    {
      name: "Lucia's Italian Bistro", 
      address: "0x8B3c5c4e5f6A1c2d3e4f5a6b7c8d9e0f1a2b3c4d" // Replace with actual restaurant wallet
    },
    {
      name: "Rooftop Grill NYC",
      address: "0x9C4d6d5e6f7A2c3d4e5f6a7b8c9d0e1f2a3b4c5d" // Replace with actual restaurant wallet
    }
  ];
  
  console.log(`📍 Contract Address: ${deploymentInfo.contractAddress}`);
  
  for (const restaurant of restaurants) {
    try {
      console.log(`\n🏪 Registering: ${restaurant.name}`);
      console.log(`📍 Address: ${restaurant.address}`);
      
      const tx = await paymentProcessor.registerRestaurant(
        restaurant.address,
        restaurant.name
      );
      
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      await tx.wait();
      
      console.log(`✅ ${restaurant.name} registered successfully!`);
      
      // Verify registration
      const restaurantInfo = await paymentProcessor.getRestaurant(restaurant.address);
      console.log(`📊 Verified: ${restaurantInfo.name} (Active: ${restaurantInfo.isActive})`);
      
    } catch (error) {
      console.error(`❌ Failed to register ${restaurant.name}:`, error.message);
    }
  }
  
  console.log("\n🎉 Restaurant registration completed!");
  console.log("\n📋 Registered Restaurants:");
  
  for (const restaurant of restaurants) {
    try {
      const info = await paymentProcessor.getRestaurant(restaurant.address);
      if (info.isActive) {
        console.log(`✅ ${info.name} - ${restaurant.address}`);
      }
    } catch (error) {
      console.log(`❌ ${restaurant.name} - Registration failed`);
    }
  }
}

main()
  .then(() => {
    console.log("\n✅ All restaurants processed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Registration failed:");
    console.error(error);
    process.exit(1);
  });
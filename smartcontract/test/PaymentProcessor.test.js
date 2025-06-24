const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentProcessor", function () {
  let paymentProcessor;
  let mockPYUSD;
  let owner;
  let restaurant;
  let customer;
  let feeRecipient;
  
  const PYUSD_DECIMALS = 6;
  const INITIAL_BALANCE = ethers.parseUnits("1000", PYUSD_DECIMALS); // 1000 PYUSD
  
  beforeEach(async function () {
    [owner, restaurant, customer, feeRecipient] = await ethers.getSigners();
    
    // Deploy mock PYUSD token
    const MockERC20 = await ethers.getContractFactory("contracts/test/MockERC20.sol:MockERC20");
    mockPYUSD = await MockERC20.deploy("PayPal USD", "PYUSD", PYUSD_DECIMALS);
    
    // Deploy PaymentProcessor
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessor.deploy(
      await mockPYUSD.getAddress(),
      feeRecipient.address
    );
    
    // Mint PYUSD to customer
    await mockPYUSD.mint(customer.address, INITIAL_BALANCE);
  });
  
  describe("Deployment", function () {
    it("Should set the correct PYUSD token address", async function () {
      expect(await paymentProcessor.pyusdToken()).to.equal(await mockPYUSD.getAddress());
    });
    
    it("Should set the correct fee recipient", async function () {
      expect(await paymentProcessor.feeRecipient()).to.equal(feeRecipient.address);
    });
    
    it("Should set the correct owner", async function () {
      expect(await paymentProcessor.owner()).to.equal(owner.address);
    });
  });
  
  describe("Restaurant Registration", function () {
    it("Should register a restaurant successfully", async function () {
      await paymentProcessor.registerRestaurant(restaurant.address, "Test Restaurant");
      
      const restaurantInfo = await paymentProcessor.getRestaurant(restaurant.address);
      expect(restaurantInfo.name).to.equal("Test Restaurant");
      expect(restaurantInfo.isActive).to.be.true;
      expect(restaurantInfo.walletAddress).to.equal(restaurant.address);
    });
    
    it("Should not allow non-owner to register restaurant", async function () {
      await expect(
        paymentProcessor.connect(customer).registerRestaurant(restaurant.address, "Test Restaurant")
      ).to.be.revertedWithCustomError(paymentProcessor, "OwnableUnauthorizedAccount");
    });
    
    it("Should not register duplicate restaurant", async function () {
      await paymentProcessor.registerRestaurant(restaurant.address, "Test Restaurant");
      
      await expect(
        paymentProcessor.registerRestaurant(restaurant.address, "Test Restaurant 2")
      ).to.be.revertedWith("Restaurant already registered");
    });
  });
  
  describe("Payment Processing", function () {
    beforeEach(async function () {
      // Register restaurant
      await paymentProcessor.registerRestaurant(restaurant.address, "Test Restaurant");
      
      // Approve PaymentProcessor to spend customer's PYUSD
      await mockPYUSD.connect(customer).approve(
        await paymentProcessor.getAddress(),
        INITIAL_BALANCE
      );
    });
    
    it("Should process payment successfully", async function () {
      const paymentAmount = ethers.parseUnits("100", PYUSD_DECIMALS); // 100 PYUSD
      const billDetails = JSON.stringify({
        items: [{ name: "Pizza", price: 100 }]
      });
      
      await expect(
        paymentProcessor.connect(customer).processPayment(
          restaurant.address,
          paymentAmount,
          billDetails
        )
      ).to.emit(paymentProcessor, "PaymentProcessed");
      
      // Check payment was recorded
      const payment = await paymentProcessor.getPayment(1);
      expect(payment.customer).to.equal(customer.address);
      expect(payment.restaurant).to.equal(restaurant.address);
      expect(payment.amount).to.equal(paymentAmount);
    });
    
    it("Should calculate and transfer platform fee correctly", async function () {
      const paymentAmount = ethers.parseUnits("100", PYUSD_DECIMALS); // 100 PYUSD
      const expectedFee = paymentAmount * 250n / 10000n; // 2.5% fee
      const expectedRestaurantAmount = paymentAmount - expectedFee;
      
      const initialRestaurantBalance = await mockPYUSD.balanceOf(restaurant.address);
      const initialFeeRecipientBalance = await mockPYUSD.balanceOf(feeRecipient.address);
      
      await paymentProcessor.connect(customer).processPayment(
        restaurant.address,
        paymentAmount,
        "test bill"
      );
      
      const finalRestaurantBalance = await mockPYUSD.balanceOf(restaurant.address);
      const finalFeeRecipientBalance = await mockPYUSD.balanceOf(feeRecipient.address);
      
      expect(finalRestaurantBalance - initialRestaurantBalance).to.equal(expectedRestaurantAmount);
      expect(finalFeeRecipientBalance - initialFeeRecipientBalance).to.equal(expectedFee);
    });
    
    it("Should not process payment for inactive restaurant", async function () {
      const paymentAmount = ethers.parseUnits("100", PYUSD_DECIMALS);
      
      await expect(
        paymentProcessor.connect(customer).processPayment(
          customer.address, // Not a registered restaurant
          paymentAmount,
          "test bill"
        )
      ).to.be.revertedWith("Invalid restaurant");
    });
    
    it("Should not process zero amount payment", async function () {
      await expect(
        paymentProcessor.connect(customer).processPayment(
          restaurant.address,
          0,
          "test bill"
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });
  
  describe("Statistics", function () {
    beforeEach(async function () {
      await paymentProcessor.registerRestaurant(restaurant.address, "Test Restaurant");
      await mockPYUSD.connect(customer).approve(
        await paymentProcessor.getAddress(),
        INITIAL_BALANCE
      );
    });
    
    it("Should track payment statistics correctly", async function () {
      const paymentAmount = ethers.parseUnits("100", PYUSD_DECIMALS);
      
      await paymentProcessor.connect(customer).processPayment(
        restaurant.address,
        paymentAmount,
        "test bill"
      );
      
      const stats = await paymentProcessor.getStats();
      expect(stats.totalPayments).to.equal(1);
      expect(stats.totalVolume).to.equal(paymentAmount);
    });
  });
});
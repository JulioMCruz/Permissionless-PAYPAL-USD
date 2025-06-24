const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReviewNFT", function () {
  let reviewNFT;
  let paymentProcessor;
  let owner;
  let reviewer;
  let restaurant;
  let tipper;
  
  const BASE_IMAGE_URI = "https://api.restaurant-nft.com/images/";
  const RESTAURANT_NAME = "Test Restaurant";
  const REVIEW_TEXT = "Amazing food and great service!";
  const RATING = 5;
  const BILL_ID = 1;
  
  beforeEach(async function () {
    [owner, reviewer, restaurant, tipper] = await ethers.getSigners();
    
    // Deploy mock payment processor
    const MockPaymentProcessor = await ethers.getContractFactory("contracts/test/MockPaymentProcessor.sol:MockPaymentProcessor");
    paymentProcessor = await MockPaymentProcessor.deploy();
    
    // Deploy ReviewNFT
    const ReviewNFT = await ethers.getContractFactory("ReviewNFT");
    reviewNFT = await ReviewNFT.deploy(
      await paymentProcessor.getAddress(),
      BASE_IMAGE_URI
    );
  });
  
  describe("Deployment", function () {
    it("Should set the correct payment processor", async function () {
      expect(await reviewNFT.paymentProcessor()).to.equal(await paymentProcessor.getAddress());
    });
    
    it("Should set the correct owner", async function () {
      expect(await reviewNFT.owner()).to.equal(owner.address);
    });
    
    it("Should initialize with zero total reviews", async function () {
      expect(await reviewNFT.totalReviews()).to.equal(0);
    });
  });
  
  describe("Review Creation", function () {
    it("Should create a review NFT successfully", async function () {
      await expect(
        paymentProcessor.createReview(
          await reviewNFT.getAddress(),
          reviewer.address,
          restaurant.address,
          BILL_ID,
          RATING,
          REVIEW_TEXT,
          RESTAURANT_NAME
        )
      ).to.emit(reviewNFT, "ReviewCreated");
      
      // Check NFT was minted
      expect(await reviewNFT.balanceOf(reviewer.address)).to.equal(1);
      expect(await reviewNFT.ownerOf(1)).to.equal(reviewer.address);
      
      // Check review data
      const review = await reviewNFT.getReview(1);
      expect(review.reviewer).to.equal(reviewer.address);
      expect(review.restaurant).to.equal(restaurant.address);
      expect(review.rating).to.equal(RATING);
      expect(review.reviewText).to.equal(REVIEW_TEXT);
      expect(review.restaurantName).to.equal(RESTAURANT_NAME);
      expect(review.isActive).to.be.true;
    });
    
    it("Should not allow non-payment processor to create reviews", async function () {
      await expect(
        reviewNFT.connect(reviewer).createReview(
          reviewer.address,
          restaurant.address,
          BILL_ID,
          RATING,
          REVIEW_TEXT,
          RESTAURANT_NAME
        )
      ).to.be.revertedWith("Only payment processor");
    });
    
    it("Should not create duplicate review for same bill ID", async function () {
      // Create first review
      await paymentProcessor.createReview(
        await reviewNFT.getAddress(),
        reviewer.address,
        restaurant.address,
        BILL_ID,
        RATING,
        REVIEW_TEXT,
        RESTAURANT_NAME
      );
      
      // Try to create duplicate
      await expect(
        paymentProcessor.createReview(
          await reviewNFT.getAddress(),
          reviewer.address,
          restaurant.address,
          BILL_ID,
          RATING,
          "Another review",
          RESTAURANT_NAME
        )
      ).to.be.revertedWith("Review already exists for this bill");
    });
    
    it("Should not accept invalid rating", async function () {
      await expect(
        paymentProcessor.createReview(
          await reviewNFT.getAddress(),
          reviewer.address,
          restaurant.address,
          BILL_ID,
          0, // Invalid rating
          REVIEW_TEXT,
          RESTAURANT_NAME
        )
      ).to.be.revertedWith("Invalid rating");
      
      await expect(
        paymentProcessor.createReview(
          await reviewNFT.getAddress(),
          reviewer.address,
          restaurant.address,
          BILL_ID,
          6, // Invalid rating
          REVIEW_TEXT,
          RESTAURANT_NAME
        )
      ).to.be.revertedWith("Invalid rating");
    });
  });
  
  describe("Review Tipping", function () {
    beforeEach(async function () {
      // Create a review first
      await paymentProcessor.createReview(
        await reviewNFT.getAddress(),
        reviewer.address,
        restaurant.address,
        BILL_ID,
        RATING,
        REVIEW_TEXT,
        RESTAURANT_NAME
      );
    });
    
    it("Should allow tipping a review", async function () {
      const tipAmount = ethers.parseEther("0.1");
      const initialBalance = await ethers.provider.getBalance(reviewer.address);
      
      await expect(
        reviewNFT.connect(tipper).tipReview(1, { value: tipAmount })
      ).to.emit(reviewNFT, "ReviewTipped");
      
      // Check tip was recorded
      expect(await reviewNFT.reviewTips(1, tipper.address)).to.equal(tipAmount);
      
      // Check review total tips updated
      const review = await reviewNFT.getReview(1);
      expect(review.totalTips).to.equal(tipAmount);
      
      // Check reviewer received tip
      const finalBalance = await ethers.provider.getBalance(reviewer.address);
      expect(finalBalance - initialBalance).to.equal(tipAmount);
    });
    
    it("Should not allow zero value tips", async function () {
      await expect(
        reviewNFT.connect(tipper).tipReview(1, { value: 0 })
      ).to.be.revertedWith("Tip amount must be greater than 0");
    });
    
    it("Should not allow tipping non-existent review", async function () {
      await expect(
        reviewNFT.connect(tipper).tipReview(999, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Review does not exist");
    });
  });
  
  describe("Restaurant Statistics", function () {
    it("Should update restaurant statistics correctly", async function () {
      // Create multiple reviews for same restaurant
      await paymentProcessor.createReview(
        await reviewNFT.getAddress(),
        reviewer.address,
        restaurant.address,
        1,
        5,
        "Great food!",
        RESTAURANT_NAME
      );
      
      await paymentProcessor.createReview(
        await reviewNFT.getAddress(),
        tipper.address,
        restaurant.address,
        2,
        4,
        "Good service!",
        RESTAURANT_NAME
      );
      
      const stats = await reviewNFT.getRestaurantStats(restaurant.address);
      expect(stats.totalReviews).to.equal(2);
      expect(stats.totalRating).to.equal(9); // 5 + 4
      expect(stats.averageRating).to.equal(450); // (9 * 100) / 2 = 450
    });
  });
  
  describe("Review Management", function () {
    beforeEach(async function () {
      await paymentProcessor.createReview(
        await reviewNFT.getAddress(),
        reviewer.address,
        restaurant.address,
        BILL_ID,
        RATING,
        REVIEW_TEXT,
        RESTAURANT_NAME
      );
    });
    
    it("Should allow owner to deactivate review", async function () {
      await reviewNFT.deactivateReview(1);
      
      const review = await reviewNFT.getReview(1);
      expect(review.isActive).to.be.false;
    });
    
    it("Should allow reporting reviews", async function () {
      await expect(
        reviewNFT.connect(tipper).reportReview(1, "Inappropriate content")
      ).to.emit(reviewNFT, "ReviewReported");
    });
    
    it("Should not allow tipping deactivated reviews", async function () {
      await reviewNFT.deactivateReview(1);
      
      await expect(
        reviewNFT.connect(tipper).tipReview(1, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Review is not active");
    });
  });
  
  describe("Token URI and Metadata", function () {
    beforeEach(async function () {
      await paymentProcessor.createReview(
        await reviewNFT.getAddress(),
        reviewer.address,
        restaurant.address,
        BILL_ID,
        RATING,
        REVIEW_TEXT,
        RESTAURANT_NAME
      );
    });
    
    it("Should generate valid token URI", async function () {
      const tokenURI = await reviewNFT.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64,");
      
      // Decode and verify JSON structure
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const jsonData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(jsonData);
      
      expect(metadata.name).to.include("Review #1");
      expect(metadata.name).to.include(RESTAURANT_NAME);
      expect(metadata.attributes).to.be.an('array');
      expect(metadata.attributes.length).to.be.greaterThan(0);
    });
  });
  
  describe("Access Control", function () {
    it("Should allow owner to pause/unpause", async function () {
      await reviewNFT.pause();
      expect(await reviewNFT.paused()).to.be.true;
      
      await reviewNFT.unpause();
      expect(await reviewNFT.paused()).to.be.false;
    });
    
    it("Should not allow non-owner to pause", async function () {
      await expect(
        reviewNFT.connect(reviewer).pause()
      ).to.be.revertedWithCustomError(reviewNFT, "OwnableUnauthorizedAccount");
    });
  });
});
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title ReviewNFT
 * @dev NFT contract for restaurant reviews with on-chain metadata
 */
contract ReviewNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;
    
    // Events
    event ReviewCreated(
        uint256 indexed tokenId,
        address indexed reviewer,
        address indexed restaurant,
        uint256 billId,
        uint8 rating,
        uint256 timestamp
    );
    
    event ReviewTipped(
        uint256 indexed tokenId,
        address indexed tipper,
        uint256 amount,
        uint256 timestamp
    );
    
    event ReviewReported(
        uint256 indexed tokenId,
        address indexed reporter,
        string reason,
        uint256 timestamp
    );
    
    // Structs
    struct Review {
        uint256 tokenId;
        address reviewer;
        address restaurant;
        uint256 billId;
        uint8 rating; // 1-5 stars
        string reviewText;
        string restaurantName;
        uint256 timestamp;
        uint256 totalTips;
        bool isActive;
    }
    
    struct RestaurantStats {
        uint256 totalReviews;
        uint256 totalRating;
        uint256 averageRating; // Calculated value * 100 for precision
    }
    
    // State variables
    mapping(uint256 => Review) public reviews;
    mapping(address => uint256[]) public reviewerTokens;
    mapping(address => uint256[]) public restaurantReviews;
    mapping(address => RestaurantStats) public restaurantStats;
    mapping(uint256 => mapping(address => uint256)) public reviewTips;
    mapping(uint256 => bool) public billIdUsed;
    
    uint256 private _nextTokenId = 1;
    uint256 public totalReviews;
    string private _baseImageURI;
    
    // Platform settings
    address public paymentProcessor;
    uint256 public minimumRating = 1;
    uint256 public maximumRating = 5;
    
    modifier onlyPaymentProcessor() {
        require(msg.sender == paymentProcessor, "Only payment processor");
        _;
    }
    
    modifier validRating(uint8 _rating) {
        require(_rating >= minimumRating && _rating <= maximumRating, "Invalid rating");
        _;
    }
    
    modifier reviewExists(uint256 _tokenId) {
        require(_ownerOf(_tokenId) != address(0), "Review does not exist");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _paymentProcessor Address of the payment processor contract
     * @param _baseImageURI Base URI for NFT images
     */
    constructor(
        address _paymentProcessor,
        string memory _baseImageURI
    ) ERC721("Restaurant Review NFT", "RNFT") Ownable(msg.sender) {
        paymentProcessor = _paymentProcessor;
        _baseImageURI = _baseImageURI;
    }
    
    /**
     * @dev Create a new review NFT
     * @param _reviewer Address of the reviewer
     * @param _restaurant Address of the restaurant
     * @param _billId Bill ID from payment processor
     * @param _rating Rating (1-5)
     * @param _reviewText Review text content
     * @param _restaurantName Name of the restaurant
     */
    function createReview(
        address _reviewer,
        address _restaurant,
        uint256 _billId,
        uint8 _rating,
        string calldata _reviewText,
        string calldata _restaurantName
    ) external onlyPaymentProcessor whenNotPaused validRating(_rating) returns (uint256) {
        require(_reviewer != address(0), "Invalid reviewer address");
        require(_restaurant != address(0), "Invalid restaurant address");
        require(bytes(_reviewText).length > 0, "Review text required");
        require(bytes(_restaurantName).length > 0, "Restaurant name required");
        require(!billIdUsed[_billId], "Review already exists for this bill");
        
        uint256 tokenId = _nextTokenId++;
        
        // Create review struct
        reviews[tokenId] = Review({
            tokenId: tokenId,
            reviewer: _reviewer,
            restaurant: _restaurant,
            billId: _billId,
            rating: _rating,
            reviewText: _reviewText,
            restaurantName: _restaurantName,
            timestamp: block.timestamp,
            totalTips: 0,
            isActive: true
        });
        
        // Update mappings
        reviewerTokens[_reviewer].push(tokenId);
        restaurantReviews[_restaurant].push(tokenId);
        billIdUsed[_billId] = true;
        
        // Update restaurant stats
        _updateRestaurantStats(_restaurant, _rating);
        
        // Mint NFT to reviewer
        _safeMint(_reviewer, tokenId);
        
        // Set token URI with on-chain metadata
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
        
        totalReviews++;
        
        emit ReviewCreated(
            tokenId,
            _reviewer,
            _restaurant,
            _billId,
            _rating,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Tip a review (send ETH to reviewer)
     * @param _tokenId Token ID of the review
     */
    function tipReview(uint256 _tokenId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        reviewExists(_tokenId) 
    {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(reviews[_tokenId].isActive, "Review is not active");
        
        Review storage review = reviews[_tokenId];
        address reviewer = ownerOf(_tokenId);
        
        // Update tip tracking
        reviewTips[_tokenId][msg.sender] += msg.value;
        review.totalTips += msg.value;
        
        // Transfer tip to reviewer
        (bool success, ) = payable(reviewer).call{value: msg.value}("");
        require(success, "Tip transfer failed");
        
        emit ReviewTipped(_tokenId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Report a review for inappropriate content
     * @param _tokenId Token ID of the review
     * @param _reason Reason for reporting
     */
    function reportReview(uint256 _tokenId, string calldata _reason) 
        external 
        reviewExists(_tokenId) 
    {
        require(bytes(_reason).length > 0, "Report reason required");
        require(reviews[_tokenId].isActive, "Review is not active");
        
        emit ReviewReported(_tokenId, msg.sender, _reason, block.timestamp);
    }
    
    /**
     * @dev Deactivate a review (owner only)
     * @param _tokenId Token ID to deactivate
     */
    function deactivateReview(uint256 _tokenId) 
        external 
        onlyOwner 
        reviewExists(_tokenId) 
    {
        reviews[_tokenId].isActive = false;
    }
    
    /**
     * @dev Get review details
     * @param _tokenId Token ID of the review
     */
    function getReview(uint256 _tokenId) 
        external 
        view 
        reviewExists(_tokenId) 
        returns (Review memory) 
    {
        return reviews[_tokenId];
    }
    
    /**
     * @dev Get reviews by reviewer
     * @param _reviewer Address of the reviewer
     */
    function getReviewsByReviewer(address _reviewer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return reviewerTokens[_reviewer];
    }
    
    /**
     * @dev Get reviews by restaurant
     * @param _restaurant Address of the restaurant
     */
    function getReviewsByRestaurant(address _restaurant) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return restaurantReviews[_restaurant];
    }
    
    /**
     * @dev Get restaurant statistics
     * @param _restaurant Address of the restaurant
     */
    function getRestaurantStats(address _restaurant) 
        external 
        view 
        returns (RestaurantStats memory) 
    {
        return restaurantStats[_restaurant];
    }
    
    /**
     * @dev Generate on-chain metadata for NFT
     * @param _tokenId Token ID
     */
    function _generateTokenURI(uint256 _tokenId) internal view returns (string memory) {
        Review memory review = reviews[_tokenId];
        
        // Generate star display
        string memory stars = "";
        for (uint256 i = 0; i < 5; i++) {
            if (i < review.rating) {
                stars = string(abi.encodePacked(stars, unicode"⭐"));
            } else {
                stars = string(abi.encodePacked(stars, unicode"☆"));
            }
        }
        
        // Create JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Review #',
                        _tokenId.toString(),
                        ' - ',
                        review.restaurantName,
                        '", "description": "Restaurant review NFT for ',
                        review.restaurantName,
                        '", "image": "',
                        _baseImageURI,
                        _tokenId.toString(),
                        '.png", "attributes": [',
                        '{"trait_type": "Restaurant", "value": "',
                        review.restaurantName,
                        '"}, ',
                        '{"trait_type": "Rating", "value": "',
                        uint256(review.rating).toString(),
                        '"}, ',
                        '{"trait_type": "Stars", "value": "',
                        stars,
                        '"}, ',
                        '{"trait_type": "Timestamp", "value": "',
                        review.timestamp.toString(),
                        '"}, ',
                        '{"trait_type": "Total Tips", "value": "',
                        review.totalTips.toString(),
                        '"}]}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    /**
     * @dev Update restaurant statistics
     * @param _restaurant Restaurant address
     * @param _rating New rating to add
     */
    function _updateRestaurantStats(address _restaurant, uint8 _rating) internal {
        RestaurantStats storage stats = restaurantStats[_restaurant];
        stats.totalReviews++;
        stats.totalRating += _rating;
        stats.averageRating = (stats.totalRating * 100) / stats.totalReviews;
    }
    
    /**
     * @dev Set payment processor address (owner only)
     * @param _paymentProcessor New payment processor address
     */
    function setPaymentProcessor(address _paymentProcessor) external onlyOwner {
        require(_paymentProcessor != address(0), "Invalid address");
        paymentProcessor = _paymentProcessor;
    }
    
    /**
     * @dev Set base image URI (owner only)
     * @param _baseImageURI New base image URI
     */
    function setBaseImageURI(string calldata _baseImageURI) external onlyOwner {
        _baseImageURI = _baseImageURI;
    }
    
    /**
     * @dev Pause the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalNFTs,
        uint256 totalActiveReviews,
        uint256 nextToken
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (reviews[i].isActive) {
                activeCount++;
            }
        }
        
        return (totalReviews, activeCount, _nextTokenId);
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
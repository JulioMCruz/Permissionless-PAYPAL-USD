// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PaymentProcessor
 * @dev Smart contract for processing restaurant bill payments using PYUSD
 */
contract PaymentProcessor is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable pyusdToken;
    
    // Events
    event PaymentProcessed(
        address indexed customer,
        address indexed restaurant,
        uint256 indexed billId,
        uint256 amount,
        uint256 timestamp
    );
    
    event RestaurantRegistered(
        address indexed restaurant,
        string name,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        address indexed restaurant,
        uint256 amount,
        uint256 timestamp
    );
    
    // Structs
    struct Restaurant {
        string name;
        address walletAddress;
        bool isActive;
        uint256 totalReceived;
        uint256 registeredAt;
    }
    
    struct Payment {
        address customer;
        address restaurant;
        uint256 amount;
        uint256 timestamp;
        string billDetails; // JSON string with bill details
    }
    
    // State variables
    mapping(address => Restaurant) public restaurants;
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public customerPayments;
    mapping(address => uint256[]) public restaurantPayments;
    
    uint256 public nextBillId = 1;
    uint256 public totalPaymentsProcessed;
    uint256 public totalVolumeProcessed;
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max
    address public feeRecipient;
    
    modifier onlyActiveRestaurant() {
        require(restaurants[msg.sender].isActive, "Restaurant not active");
        _;
    }
    
    modifier validRestaurant(address _restaurant) {
        require(restaurants[_restaurant].isActive, "Invalid restaurant");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _pyusdToken Address of the PYUSD token contract
     * @param _feeRecipient Address to receive platform fees
     */
    constructor(
        address _pyusdToken,
        address _feeRecipient
    ) Ownable(msg.sender) {
        require(_pyusdToken != address(0), "Invalid PYUSD address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        pyusdToken = IERC20(_pyusdToken);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Register a new restaurant
     * @param _restaurant Address of the restaurant wallet
     * @param _name Name of the restaurant
     */
    function registerRestaurant(
        address _restaurant,
        string calldata _name
    ) external onlyOwner {
        require(_restaurant != address(0), "Invalid restaurant address");
        require(bytes(_name).length > 0, "Restaurant name required");
        require(!restaurants[_restaurant].isActive, "Restaurant already registered");
        
        restaurants[_restaurant] = Restaurant({
            name: _name,
            walletAddress: _restaurant,
            isActive: true,
            totalReceived: 0,
            registeredAt: block.timestamp
        });
        
        emit RestaurantRegistered(_restaurant, _name, block.timestamp);
    }
    
    /**
     * @dev Process a payment for a restaurant bill
     * @param _restaurant Address of the restaurant
     * @param _amount Amount in PYUSD (with 6 decimals)
     * @param _billDetails JSON string containing bill details
     */
    function processPayment(
        address _restaurant,
        uint256 _amount,
        string calldata _billDetails
    ) external nonReentrant whenNotPaused validRestaurant(_restaurant) {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_billDetails).length > 0, "Bill details required");
        
        // Calculate platform fee
        uint256 feeAmount = (_amount * platformFee) / 10000;
        uint256 restaurantAmount = _amount - feeAmount;
        
        // Transfer PYUSD from customer to contract
        require(
            pyusdToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Transfer to restaurant (minus fee)
        require(
            pyusdToken.transfer(_restaurant, restaurantAmount),
            "Restaurant transfer failed"
        );
        
        // Transfer fee to platform (if any)
        if (feeAmount > 0) {
            require(
                pyusdToken.transfer(feeRecipient, feeAmount),
                "Fee transfer failed"
            );
        }
        
        // Record the payment
        uint256 billId = nextBillId++;
        payments[billId] = Payment({
            customer: msg.sender,
            restaurant: _restaurant,
            amount: _amount,
            timestamp: block.timestamp,
            billDetails: _billDetails
        });
        
        // Update tracking arrays
        customerPayments[msg.sender].push(billId);
        restaurantPayments[_restaurant].push(billId);
        
        // Update statistics
        restaurants[_restaurant].totalReceived += restaurantAmount;
        totalPaymentsProcessed++;
        totalVolumeProcessed += _amount;
        
        emit PaymentProcessed(
            msg.sender,
            _restaurant,
            billId,
            _amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Get customer's payment history
     * @param _customer Address of the customer
     */
    function getCustomerPayments(address _customer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return customerPayments[_customer];
    }
    
    /**
     * @dev Get restaurant's payment history
     * @param _restaurant Address of the restaurant
     */
    function getRestaurantPayments(address _restaurant) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return restaurantPayments[_restaurant];
    }
    
    /**
     * @dev Get payment details by bill ID
     * @param _billId The bill ID
     */
    function getPayment(uint256 _billId) 
        external 
        view 
        returns (Payment memory) 
    {
        return payments[_billId];
    }
    
    /**
     * @dev Get restaurant details
     * @param _restaurant Address of the restaurant
     */
    function getRestaurant(address _restaurant) 
        external 
        view 
        returns (Restaurant memory) 
    {
        return restaurants[_restaurant];
    }
    
    /**
     * @dev Set platform fee (only owner)
     * @param _newFee New fee in basis points
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_PLATFORM_FEE, "Fee too high");
        platformFee = _newFee;
    }
    
    /**
     * @dev Set fee recipient (only owner)
     * @param _newRecipient New fee recipient address
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
    }
    
    /**
     * @dev Deactivate a restaurant (only owner)
     * @param _restaurant Address of the restaurant
     */
    function deactivateRestaurant(address _restaurant) external onlyOwner {
        restaurants[_restaurant].isActive = false;
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal function (only owner)
     * @param _token Token to withdraw
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalPayments,
        uint256 totalVolume,
        uint256 currentFee,
        address feeRecipientAddress
    ) {
        return (
            totalPaymentsProcessed,
            totalVolumeProcessed,
            platformFee,
            feeRecipient
        );
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReviewNFT {
    function createReview(
        address _reviewer,
        address _restaurant,
        uint256 _billId,
        uint8 _rating,
        string calldata _reviewText,
        string calldata _restaurantName
    ) external returns (uint256);
}

contract MockPaymentProcessor {
    function createReview(
        address _reviewNFT,
        address _reviewer,
        address _restaurant,
        uint256 _billId,
        uint8 _rating,
        string calldata _reviewText,
        string calldata _restaurantName
    ) external returns (uint256) {
        return IReviewNFT(_reviewNFT).createReview(
            _reviewer,
            _restaurant,
            _billId,
            _rating,
            _reviewText,
            _restaurantName
        );
    }
}
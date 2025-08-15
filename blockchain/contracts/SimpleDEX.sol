// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleDEX
 * @dev A simple decentralized exchange using the constant product formula (x * y = k).
 */
contract SimpleDEX is Ownable, ReentrancyGuard {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 private constant MINIMUM_LIQUIDITY = 10**3;

    event Swap(
        address indexed sender,
        uint256 amountIn,
        uint256 amountOut,
        address indexed tokenIn,
        address indexed tokenOut
    );
    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB
    );

    error InvalidToken();
    error ZeroAmount();
    error InsufficientLiquidity();
    error InsufficientAmountOut();
    error DeadlineExceeded();

    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        if (_tokenA == address(0) || _tokenB == address(0) || _tokenA == _tokenB) {
            revert InvalidToken();
        }
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    /**
     * @dev Adds liquidity to the pool.
     */
    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        if (reserveA > 0 || reserveB > 0) {
            uint256 amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = (amountBDesired * reserveA) / reserveB;
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        } else {
            amountA = amountADesired;
            amountB = amountBDesired;
        }

        if (amountA == 0 || amountB == 0) revert ZeroAmount();

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    /**
     * @dev Swaps a precise amount of Token A for as much Token B as possible.
     */
    function swapAtoB(uint256 amountIn, uint256 minAmountOut, uint256 deadline) external nonReentrant {
        if (block.timestamp > deadline) revert DeadlineExceeded();
        if (amountIn == 0) revert ZeroAmount();

        uint256 amountOut = getAmountOut(amountIn, reserveA, reserveB);
        if (amountOut < minAmountOut) revert InsufficientAmountOut();

        tokenA.transferFrom(msg.sender, address(this), amountIn);

        reserveA += amountIn;
        reserveB -= amountOut;

        tokenB.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, amountIn, amountOut, address(tokenA), address(tokenB));
    }

    /**
     * @dev Swaps a precise amount of Token B for as much Token A as possible.
     */
    function swapBtoA(uint256 amountIn, uint256 minAmountOut, uint256 deadline) external nonReentrant {
        if (block.timestamp > deadline) revert DeadlineExceeded();
        if (amountIn == 0) revert ZeroAmount();

        uint256 amountOut = getAmountOut(amountIn, reserveB, reserveA);
        if (amountOut < minAmountOut) revert InsufficientAmountOut();

        tokenB.transferFrom(msg.sender, address(this), amountIn);

        reserveB += amountIn;
        reserveA -= amountOut;

        tokenA.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, amountIn, amountOut, address(tokenB), address(tokenA));
    }

    /**
     * @dev Calculates the output amount for a given input amount based on current reserves.
     * Formula: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
    }

    /**
     * @dev Public view function to get the current exchange rate for swapping 1 unit of a token.
     * @param _tokenIn The address of the input token.
     * @return The amount of output token for 1 unit of input token (with 18 decimals).
     */
    function getPrice(address _tokenIn) external view returns (uint256) {
        if (reserveA == 0 || reserveB == 0) return 0;
        uint256 oneUnit = 10**18;

        if (_tokenIn == address(tokenA)) {
            return getAmountOut(oneUnit, reserveA, reserveB);
        } else if (_tokenIn == address(tokenB)) {
            return getAmountOut(oneUnit, reserveB, reserveA);
        } else {
            revert InvalidToken();
        }
    }
}
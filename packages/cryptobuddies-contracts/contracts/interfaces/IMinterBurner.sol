// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IMinterBurner {
    // Mint a single token.
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    // Mints a batch of tokens.
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;

    // Burns a single token.
    function burn(
        address to,
        uint256 id,
        uint256 amount
    ) external;

    // Burns a batch of tokens.
    function burnBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external;

    function balanceOf(
        address account,
        uint256 id
    ) external pure returns (uint256);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";


// AccessoriesOfficial is an ERC1155 contract that contains Crypto Buddies Accessories Official.
contract AccessoriesOfficial is Ownable, ERC1155Supply, ERC1155URIStorage, ERC1155PresetMinterPauser {
    // Contract name
    string public name;
    
    // Contract symbol
    string public symbol;
    
    constructor(string memory _uri) ERC1155PresetMinterPauser(_uri) {
        name = "Crypto Buddies Accessories Official";
        symbol = "CBAO1";
    }

    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return super.uri(tokenId);
    }

    function setUri(uint256 tokenId, string memory tokenURI) external whenNotPaused onlyOwner {
        _setURI(tokenId, tokenURI);
    }

    function setDefaultUri(string memory tokenURI) external whenNotPaused onlyOwner {
        _setURI(tokenURI);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC1155, ERC1155PresetMinterPauser)
    returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155Supply, ERC1155, ERC1155PresetMinterPauser) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @notice IPacker is the interface that describes composite
/// token encoding interface.
interface IPacker {
    /// @notice encode function encodes a composite token from layers.
    /// @param tokenId is a composite token id.
    /// @param layers is an array of layer tokens.
    function encode(uint256 tokenId, uint256[9] memory layers) external payable;

    /// @notice encode read is a read only funtion that returns
    /// base token id and encoded token id from layers.
    /// @param tokenId is a composite token id.
    /// @param layers is an array of layer tokens.
    /// @return baseId a base token id from provided tokenId.
    /// @return compositeId reincoded composite token id from
    /// user provided tokenId and layers.
    function encodeRead(
        uint256 tokenId,
        uint256[9] memory layers
    )
        external
        view
        returns (uint256 baseId, uint256 compositeId);

    /// @notice Split composable id into atom ids
    /// @param _id is a composable token id
    /// @return layers are the 9 atom ids;
    function layersFromComposableId(uint256 _id) external pure returns (uint256[9] memory layers);
    
    /// @notice Compose event describes what layers were changes
    /// @param base token used to create composite id
    /// @param layers An array of 9 layers used, each layer is a token id
    /// @param newTokenId Encoded (base + layers) token id
    event Compose(uint256 base, uint256[9] layers, uint256 newTokenId);
}
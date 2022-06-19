// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "./EncodeDecodeUtil.sol";
import "./interfaces/IPacker.sol";
import "./interfaces/IMinterBurner.sol";

/// @title CryptoBuddies Multi Layer Manager
/// @author Maksym Naboka
/// @notice Contract encodes/decodes NFT layers (uint256) into composable uint256 NFT id
/// @dev Contracts has logic how to mint and burn accessory tokens based on composable token id
contract Manager is IPacker, Context, Ownable, Pausable, EncodeDecodeUtil, ReentrancyGuard {
    /// @notice mapping of an id to accessory contract address
    mapping(uint8 => address) public accessoryAddressById;

    /// @notice composable collection address
    address public composableCollectionAddress;

    /// @notice fee for using encode function
    uint256 fee;

    /// @param _composableCollectionAddress Address of the first composable ERC1155 collection
    /// @param _accessoryAddress Address of the first accessory ERC1155 contract, id 1 will be used
    constructor(
        address _composableCollectionAddress,
        address _accessoryAddress
    ) {
        composableCollectionAddress = _composableCollectionAddress;
        accessoryAddressById[1] = _accessoryAddress;
        // TODO:(mnaboka) Update eth fee
    }

    /// @notice Admin function to pause the manager contract.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Admin funtion to unpause the manager contract.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice encode read is a read only funtion that returns
    /// base token id and encoded token id from layers.
    /// @param tokenId is a composable token id.
    /// @param layers is an array of layer tokens.
    /// @return baseId a base token id from provided tokenId.
    /// @return composableId reincoded composable token id from
    /// user provided tokenId and layers.
    function encodeRead(
        uint256 tokenId,
        uint256[9] memory layers
    )
        external
        override
        view
        returns(uint256 baseId, uint256 composableId)
    {
        (baseId, composableId,,) = _encode(false, tokenId, layers);
    }
    
    /// @notice encode takes a user composable ID and layers IDs, validates the ownership of the tokens
    /// and performs mint/burn based on the given token ids
    /// @param tokenId A composable NFT token id
    /// @param layers An array of accessory layers
    function encode(uint256 tokenId, uint256[9] memory layers) external payable override whenNotPaused nonReentrant {
        IMinterBurner composable = IMinterBurner(composableCollectionAddress);
        require(composable.balanceOf(_msgSender(), tokenId) >= 1, "Manager#encode: User doesn't own given token");
        require(msg.value >= fee, "Manager#encode: Invalid fee");

        // burn the user's given composable token id
        composable.burn(_msgSender(), tokenId, 1);

        (
            uint256 baseTokenId,
            uint256 newTokenId,
            uint256[] memory toMint,
            uint256[] memory toBurn
        ) = _encode(true, tokenId, layers);

        // mint all layers
        // we don't use batch version of mint/burn, because tokens
        // might come from the different collections.
        for (uint8 i = 0; i < toMint.length; i++) {
            if (toMint[i] > 0) {
                mintLayer(toMint[i]);
            }
        }

        // burn layers
        for (uint8 i = 0; i < toBurn.length; i++) {
            if (toBurn[i] > 0) {
                burnLayer(toBurn[i]);
            }
        }

        // mint a new tokenId
        composable.mint(_msgSender(), newTokenId, 1, "");
        emit Compose(baseTokenId, layers, newTokenId);
    }

    /// @notice implementation of IPacker interface
    /// @param _id is a composable token id
    /// @return layers are the 9 layers
    function layersFromComposableId(uint256 _id) external pure returns (uint256[9] memory layers) {
        (,layers) = _decodeLayers(_id);
    }

    /// @notice internal funtion that takes user input and encodes
    /// a composable token id from given composable/base token and layers.
    /// @param validate the flag indicates if contract needs to revert
    /// when user does not own layers tokens
    /// @param tokenId user provided base/composable token id.
    /// @param layers user provided layer tokens ids.
    /// @return baseId a decode base id from user provided composable token.
    /// if user provided base id the value will be the same.
    /// @return composableId a re-encoded composable token id from layers.
    /// @return toMint an array of tokens that user "took off" and needs
    /// to be minted.
    /// @return toBurn an array of tokens user "put on" and needs
    /// to be burned.
    function _encode(
        bool validate,
        uint256 tokenId,
        uint256[9] memory layers
    )
        internal
        view
        returns (uint256 baseId, uint256 composableId, uint256[] memory toMint, uint256[] memory toBurn)
    {
        // decode composable id into layers the user has claims to
        (uint256 baseTokenId, uint256[9] memory decodedLayers) = _decodeLayers(tokenId);

        // newTokenId will be used to re-encode the information about the layers
        uint newTokenId = tokenId;

        // an array of layers that need to be minted or burned
        uint256[] memory mintLayers = new uint256[](9);
        uint256[] memory burnLayers = new uint256[](9);

        // iterate over user given layers backwards
        for (uint256 i = layers.length; i > 0; i--) {

            // userProvidedLayer contains the user
            // token and cannot be trusted, because user can provide any
            uint256 userProvidedLayer = layers[i-1];

            // the layer decoded from tokenId and that gives user a claim
            // token can be trusted, it is decoded from tokenId
            uint256 decodedLayer = decodedLayers[i-1];

            // if both layers are equal, there is no change and we can continue
            if (userProvidedLayer == decodedLayer) {
                continue;
            }

            if (validate) {
                // check the user actually owns the provided token
                if (userProvidedLayer > 0) {
                    userOwnsLayerToken(userProvidedLayer);
                }
            }

            // user provided layers must be sorted
            if (userProvidedLayer > 0 && decodedLayer > 0) {
                require(
                    _decodeLayerNumber(decodedLayer) == _decodeLayerNumber(userProvidedLayer),
                    "Manager#encode: provided layers order is incorrect"
                );
            }

            // if user provided 0, the intention is to take off a layer
            if (userProvidedLayer == 0) {

                // update the newTokenId with information about removed token
                uint256 removedLayerId;
                (newTokenId, removedLayerId) = _encodeRemoveLayer(newTokenId, uint8(i));

                // update mintLayers array to mint this layer back to a user
                mintLayers[i - 1] = removedLayerId;
                continue;
            }

            // if user provided a layer and decoded layer is not 0
            // user wants to put on a layer
            if (decodedLayer == 0) {
                // re-encode composable token
                (newTokenId,) = _encodeReplaceLayer(newTokenId, userProvidedLayer);
                burnLayers[i - 1] = userProvidedLayer;
                continue;
            }

            // if user provided token is different from encoded token
            // user wants to replace a layer
            if (userProvidedLayer != decodedLayer) {
                uint256 replacedLayer;
                (newTokenId, replacedLayer) = _encodeReplaceLayer(newTokenId, userProvidedLayer);
                burnLayers[i - 1] = userProvidedLayer;
                mintLayers[i - 1] = replacedLayer;
                continue;
            }
        }

        return (baseTokenId, newTokenId, mintLayers, burnLayers);        
    }

    /// @notice function takes a layer id, decodes the accessory contract
    /// mints a new token
    /// @param id Token ID of NFT Layer
    function mintLayer(uint256 id) private {
        IMinterBurner accessory = getAccessoryMinterBurner(id);
        // mint a single token to a user
        accessory.mint(_msgSender(), id, 1, "");
    }

    /// @notice function takes a layer id, decodes the accessory contract
    /// burns user's token
    /// @param id Token ID of NFT Layer
    function burnLayer(uint256 id) private {
        IMinterBurner accessory = getAccessoryMinterBurner(id);
        // burn a single token to a user
        accessory.burn(_msgSender(), id, 1);
    }

    /// @notice update accessory contract address with index
    /// @param id Accessory contract id
    /// @param accessoryAddress ERC1155 accessory collection address
    function updateAccessoryAddress(uint8 id, address accessoryAddress) external onlyOwner {
        require(accessoryAddress != address(0), "Manager#updateAccessoryAddress: address cannot be 0");
        accessoryAddressById[id] = accessoryAddress;
    }

    /// @notice a helper funtion that returns an instance of IMinterBurner by
    /// a token id.
    /// @param id Layer token id.
    /// @return Instance of IMinterBurner interface.
    function getAccessoryMinterBurner(uint256 id) internal view returns (IMinterBurner) {
        // get a collection id
        uint8 auxId = _decodeAuxId(id);
        // get an address by collection id
        address accessoryAddresses = accessoryAddressById[auxId];
        // make sure the address is in the collection
        require(accessoryAddresses != address(0), "Manager#userOwnsLayerToken: Invalid accessory id");
        // init ERC1155
        return IMinterBurner(accessoryAddresses);
    }

    /// @notice the helper funtion that decoded a layer id
    /// extracts the collections id, checks if the user owns the token.
    /// @param id layer token id.
    /// @dev the funtions reverts execution if the user does not own token.
    function userOwnsLayerToken(uint256 id) internal view {
        // get an instance of accessory minter burner by a token id.
        IMinterBurner accessory = getAccessoryMinterBurner(id);
        // validate user owns a token
        require(
            accessory.balanceOf(_msgSender(), id) >= 1,
            "Manager#userOwnsLayerToken: User does not own accessory token"
        );
    }
}
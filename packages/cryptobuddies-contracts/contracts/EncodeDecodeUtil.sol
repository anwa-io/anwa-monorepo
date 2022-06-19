// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
Token encoding

Layer:
0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff ffffxx ff
                                                           BB   AA

AA - Layer position [1..10]
BB - token ID
xx - collection id

Composite:
0xff ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffff ff
0xff ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffxx ffffff ff
  R  C1     C2     C3     C4     C5     C6     C7     C8     C9     BB     AA

AA - Magic number 0xCC for composite layer
BB - base image ID
C[1-9] - number of a layer
  xx - collection id
R - reserved

*/

contract EncodeDecodeUtil {
  constructor () {}
    
  function _decodeLayers(
    uint256 tokenId
  )
    internal
    virtual
    pure
    returns (uint256 newTokenId, uint256[9] memory layerIds)
  {
    require((tokenId & 0xff) == 0xcc, "DecodeToken#decodeLayers: Invalid tokenID");
    newTokenId = tokenId & 0xffffffff;
    tokenId = tokenId >> 32;
    for (uint8 i = 9; i > 0; i--) {
      uint256 layer_token = tokenId & 0xffff;
      layer_token = layer_token << 8;
      if (layer_token > 0) {
        layer_token = layer_token | i;
      }
      layerIds[i-1] = layer_token;
      tokenId = tokenId >> 24;
    }
  }

  function _decodeAuxId(
    uint256 layerId
  )
    internal
    virtual
    pure
    returns (uint8)
  {
    layerId = layerId >> 8;
    uint256 result = layerId & 0xff;
    require(result > 0x0 && result <= 0xff, "DecodeTokenId#decodeAuxId: Invalid layerId");
    return uint8(result);
  }

  function _decodeLayerNumber(
    uint256 layerId
  )
    internal
    virtual
    pure
    returns (uint8)
  {
    uint256 result = layerId & 0xff;
    require(result > 0 && result < 10, "DecodeTokenId#decodeLayerNumber: Invalid layerId");
    return uint8(result);
  }

  function _validateLayerId(
    uint256 layerId,
    uint256 collectionId
  )
    internal
    virtual
    pure
    returns (bool)
  {
    uint256 layerNumber = layerId & 0xff;
    require(layerNumber > 0 && layerNumber <= 9, "DecodeTokenId#validateLayerId: Invalid Layer number");
    layerId = layerId >> 8;
    uint256 collectionNumber = layerId & 0xff;
    require(collectionNumber == collectionId, "DecodeTokenId#validateLayerId: Invalid collection id");
    layerId = layerId >> 8;
    uint256 encodedLayer = layerId & 0xffff;
    require(encodedLayer > 0, "DecodeTokenId#validateLayerId: Invalid encoded layer id");
    layerId = layerId >> 24;
    require(layerId | 0 == 0, "DecodeTokenId#validateLayerId: Invalid token padding");
    return true;
  }

  function _validateTokenId(
    uint256 tokenId
  )
    internal
    virtual
    pure
    returns (bool)
  {
    uint256 magic = tokenId & 0xff;
    require(magic == 0xcc, "DecodeTokenId#validateTokenId: Invalid magic");
    tokenId = tokenId >> 8;
    uint256 encodedTokenId = tokenId & 0xffffff;
    require(encodedTokenId > 0, "DecodeTokenId#validateTokenId: Invalid token id");
    return true;
  }

  function _encodeLayers(
    uint256 tokenId,
    uint256[9] memory layerIds
  )
    internal
    virtual
    pure
    returns (uint256)
  {
    uint256 result;
    for (uint8 i; i < layerIds.length; i++) {
      uint256 layer = layerIds[i];
      layer = layer >> 8;
      result = result | layer;
      result = result << 24;
    }
    result = result | tokenId;
    result = result << 8;
    result = result | 0xcc;
    return result;
  }

  function _encodeRemoveLayer(
    uint256 tokenId,
    uint8 layerNumber
  )
    internal
    virtual
    pure
    returns (uint256 newTokenId, uint256 removedLayerId)
  {
    uint256 offset = 24 * layerNumber;
    uint256 n = 0x00ffffff << (256 - (offset + 8));
    uint256 mask = (1 << (256 - 8)) - 1;
    uint256 invertedMask = n ^ mask;
    newTokenId = tokenId & invertedMask;
    removedLayerId = (tokenId & n) >> (256 - (offset + 16));
    removedLayerId = removedLayerId | layerNumber;
  }

  function _encodeReplaceLayer(
    uint256 tokenId,
    uint256 layerId
  )
    internal
    virtual
    pure
    returns (uint256 newTokenId, uint256 oldLayerId)
  {
    uint256 layerNumber = layerId & 0xff;
    require(layerNumber > 0, "EncodeTokenId#encodeReplaceLayer: Invalid layer number");
    uint256 layerData = layerId >> 8;
    uint256 layerOffset = layerNumber * 24;
    (newTokenId, oldLayerId) = _encodeRemoveLayer(tokenId, uint8(layerNumber));
    uint256 mask = layerData << (256 - (layerOffset + 8));
    newTokenId = newTokenId | mask;
  }
}
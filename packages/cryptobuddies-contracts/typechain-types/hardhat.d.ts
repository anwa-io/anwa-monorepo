/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "AccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControl__factory>;
    getContractFactory(
      name: "AccessControlEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControlEnumerable__factory>;
    getContractFactory(
      name: "IAccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControl__factory>;
    getContractFactory(
      name: "IAccessControlEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControlEnumerable__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "Pausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Pausable__factory>;
    getContractFactory(
      name: "ERC1155",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155__factory>;
    getContractFactory(
      name: "ERC1155Burnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Burnable__factory>;
    getContractFactory(
      name: "ERC1155Pausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Pausable__factory>;
    getContractFactory(
      name: "ERC1155Supply",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155Supply__factory>;
    getContractFactory(
      name: "ERC1155URIStorage",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155URIStorage__factory>;
    getContractFactory(
      name: "IERC1155MetadataURI",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155MetadataURI__factory>;
    getContractFactory(
      name: "IERC1155",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155__factory>;
    getContractFactory(
      name: "IERC1155Receiver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155Receiver__factory>;
    getContractFactory(
      name: "ERC1155PresetMinterPauser",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1155PresetMinterPauser__factory>;
    getContractFactory(
      name: "ERC721",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721__factory>;
    getContractFactory(
      name: "ERC721Enumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721Enumerable__factory>;
    getContractFactory(
      name: "IERC721Enumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Enumerable__factory>;
    getContractFactory(
      name: "IERC721Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Metadata__factory>;
    getContractFactory(
      name: "IERC721",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721__factory>;
    getContractFactory(
      name: "IERC721Receiver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Receiver__factory>;
    getContractFactory(
      name: "ERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC165__factory>;
    getContractFactory(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165__factory>;
    getContractFactory(
      name: "AccessoriesCommunity",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessoriesCommunity__factory>;
    getContractFactory(
      name: "AccessoriesOfficial",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessoriesOfficial__factory>;
    getContractFactory(
      name: "CryptoBuddies",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.CryptoBuddies__factory>;
    getContractFactory(
      name: "EncodeDecodeUtil",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.EncodeDecodeUtil__factory>;
    getContractFactory(
      name: "IMinterBurner",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IMinterBurner__factory>;
    getContractFactory(
      name: "IPacker",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPacker__factory>;
    getContractFactory(
      name: "Manager",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Manager__factory>;
    getContractFactory(
      name: "Membership",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Membership__factory>;

    getContractAt(
      name: "AccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControl>;
    getContractAt(
      name: "AccessControlEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControlEnumerable>;
    getContractAt(
      name: "IAccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControl>;
    getContractAt(
      name: "IAccessControlEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControlEnumerable>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "Pausable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Pausable>;
    getContractAt(
      name: "ERC1155",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155>;
    getContractAt(
      name: "ERC1155Burnable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Burnable>;
    getContractAt(
      name: "ERC1155Pausable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Pausable>;
    getContractAt(
      name: "ERC1155Supply",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155Supply>;
    getContractAt(
      name: "ERC1155URIStorage",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155URIStorage>;
    getContractAt(
      name: "IERC1155MetadataURI",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155MetadataURI>;
    getContractAt(
      name: "IERC1155",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155>;
    getContractAt(
      name: "IERC1155Receiver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155Receiver>;
    getContractAt(
      name: "ERC1155PresetMinterPauser",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1155PresetMinterPauser>;
    getContractAt(
      name: "ERC721",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721>;
    getContractAt(
      name: "ERC721Enumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721Enumerable>;
    getContractAt(
      name: "IERC721Enumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Enumerable>;
    getContractAt(
      name: "IERC721Metadata",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Metadata>;
    getContractAt(
      name: "IERC721",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721>;
    getContractAt(
      name: "IERC721Receiver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Receiver>;
    getContractAt(
      name: "ERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC165>;
    getContractAt(
      name: "IERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165>;
    getContractAt(
      name: "AccessoriesCommunity",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessoriesCommunity>;
    getContractAt(
      name: "AccessoriesOfficial",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessoriesOfficial>;
    getContractAt(
      name: "CryptoBuddies",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.CryptoBuddies>;
    getContractAt(
      name: "EncodeDecodeUtil",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.EncodeDecodeUtil>;
    getContractAt(
      name: "IMinterBurner",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IMinterBurner>;
    getContractAt(
      name: "IPacker",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPacker>;
    getContractAt(
      name: "Manager",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Manager>;
    getContractAt(
      name: "Membership",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Membership>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import {
  Manager,
  CryptoBuddies,
  AccessoriesOfficial,
  AccessoriesCommunity,
} from "../typechain-types";

describe("Manager", function () {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  let ManagerFactory: ContractFactory;
  let CryptoBuddiesFactory: ContractFactory;
  let AccessoriesOfficialFactory: ContractFactory;
  let AccessoriesCommunityFactory: ContractFactory;

  let manager: Manager;
  let cb: CryptoBuddies;
  let cbao: AccessoriesOfficial;
  let cbac: AccessoriesCommunity;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    // get factories
    ManagerFactory = await ethers.getContractFactory("Manager");
    CryptoBuddiesFactory = await ethers.getContractFactory("CryptoBuddies");
    AccessoriesOfficialFactory = await ethers.getContractFactory(
      "AccessoriesOfficial"
    );
    AccessoriesCommunityFactory = await ethers.getContractFactory(
      "AccessoriesCommunity"
    );

    // deploy contracts
    cb = (await CryptoBuddiesFactory.deploy(
      "https://example.com/metadata/{id}.json"
    )) as CryptoBuddies;
    await cb.deployed();

    cbao = (await AccessoriesOfficialFactory.deploy(
      "https://example.com/metadata/{id}.json"
    )) as AccessoriesOfficial;
    await cbao.deployed();

    cbac = (await AccessoriesCommunityFactory.deploy(
      "https://example.com/metadata/{id}.json"
    )) as AccessoriesCommunity;
    await cbac.deployed();

    manager = (await ManagerFactory.deploy(
      cb.address,
      cbao.address
    )) as Manager;
    await manager.deployed();

    // grant manager the role to mint/burn
    await cb.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
      manager.address
    );

    await cbao.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
      manager.address
    );

    await cbac.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
      manager.address
    );
  });

  it("should not do anything", async function () {
    // Test the user provides the composable token id and the same layers
    // TODO: might revert transaction instead?

    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId =
      "0x000101000201000301000401000501000601000701000801000901ffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);
    const layers = [
      0x010101,
      0x020102,
      0x030103,
      0x040104,
      0x050105,
      0x060106,
      0x070107,
      0x080108,
      0x090109,
    ];

    expect(await manager.encode(composableTokenId, layers))
      .to.emit(manager, "Compose")
      .withArgs("0xffffffcc", layers, composableTokenId);
  });

  it("should remove layer from composable token and mint a new layer token", async function () {
    // This test sets 0 to a layer and expects contract to re-encode
    // composable token with removed layer AND mint a new layer to a user.

    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId =
      "0x000101000201000301000401000501000601000701000801000901ffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);

    // Layer 1 is set to 0
    // Layer 9 is set to 0
    const layers = [
      0x0,
      0x020102,
      0x030103,
      0x040104,
      0x050105,
      0x060106,
      0x070107,
      0x080108,
      0x0,
    ];

    // user does not have the accessory tokens
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

    const expectedNewcomposableTokenId =
      "0x000000000201000301000401000501000601000701000801000000ffffffcc";
    // re encode composable token id and mint a new accessory token
    expect(await manager.encode(composableTokenId, layers))
      .to.emit(manager, "Compose")
      .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

    // now user should have a tokens for the layer1, layer9
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

    // also now the user should have a different composable token
    // composableTokenId should be burned and a new composable tokenId without
    // layer1 should be minted
    expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

    expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

    expect(
      await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
    ).to.equal(1);
  });

  it("should remove all layers from composable token", async function () {
    // This test sets 0 to a layer and expects contract to re-encode
    // composable token with removed layer AND mint a new layer to a user.

    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId =
      "0x000101000201000301000401000501000601000701000801000901ffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);

    const layers = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // user does not have the accessory tokens
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x020102)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x030103)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x040104)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x050105)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x060106)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x070107)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x080108)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

    const expectedNewcomposableTokenId = "0xffffffcc";
    // re encode composable token id and mint a new accessory token
    expect(await manager.encode(composableTokenId, layers))
      .to.emit(manager, "Compose")
      .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

    // now user should have a all layer tokens
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x020102)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x030103)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x040104)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x050105)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x060106)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x070107)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x080108)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

    // also now the user should have a different composable token
    // composableTokenId should be burned and a new composable tokenId without
    // layer1 should be minted
    expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

    expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

    expect(
      await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
    ).to.equal(1);
  });

  it("should encode a new composable tokenId from layers", async function () {
    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId = "0xffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);

    // mint accessories
    await cbao.mint(owner.address, 0x010101, 1, []);
    await cbao.mint(owner.address, 0x090109, 1, []);

    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

    const layers = [0x010101, 0, 0, 0, 0, 0, 0, 0, 0x090109];

    const expectedNewcomposableTokenId =
      "0x000101000000000000000000000000000000000000000000000901ffffffcc";

    // re encode composable token id and mint a new accessory token
    expect(await manager.encode(composableTokenId, layers))
      .to.emit(manager, "Compose")
      .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

    // accessory tokens must be burned
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

    expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

    expect(
      await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
    ).to.equal(1);
  });

  it("should re encode composable token id, burn user's accessory token and mint a new token", async function () {
    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId =
      "0x000101000000000000000000000000000000000000000000000901ffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);

    // mint accessories
    await cbao.mint(owner.address, 0x020101, 1, []);
    await cbao.mint(owner.address, 0x0a0109, 1, []);

    // minted accessories must be in user's wallet
    expect(await cbao.balanceOf(owner.address, 0x020101)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x0a0109)).to.equal(1);

    // the accessory token that we expect to swap
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

    const layers = [0x020101, 0, 0, 0, 0, 0, 0, 0, 0x0a0109];

    const expectedNewcomposableTokenId =
      "0x000201000000000000000000000000000000000000000000000a01ffffffcc";
    // re encode composable token id and mint a new accessory token
    expect(await manager.encode(composableTokenId, layers))
      .to.emit(manager, "Compose")
      .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

    // accessory tokens must be minted
    expect(await cbao.balanceOf(owner.address, 0x010101)).to.equal(1);
    expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

    // accessory tokens must be burned
    expect(await cbao.balanceOf(owner.address, 0x020101)).to.equal(0);
    expect(await cbao.balanceOf(owner.address, 0x0a0109)).to.equal(0);
    expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

    expect(
      await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
    ).to.equal(1);
  });

  it("should not allow user use accessory tokens user doesn't own", async function () {
    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId =
      "0x000000000000000000000000000000000000000000000000000901ffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);

    // user does not own 0x020102
    const layers = [0x0, 0x020102, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x090109];

    await expect(manager.encode(composableTokenId, layers)).to.be.revertedWith(
      "Manager#userOwnsLayerToken: User does not own accessory token"
    );
  });

  it("should revert if manager is paused", async function () {
    // approve token transfer
    await cb.setApprovalForAll(manager.address, true);
    await cbao.setApprovalForAll(manager.address, true);

    const composableTokenId =
      "0x000000000000000000000000000000000000000000000000000901ffffffcc";

    const expectedNewcomposableTokenId =
      "0x000000000201000000000000000000000000000000000000000901ffffffcc";

    // mint composable token for a user
    await cb.mint(owner.address, composableTokenId, 1, []);

    // mint layer token
    await cbao.mint(owner.address, 0x020102, 1, []);

    // user owns 0x020102
    const layers = [0x0, 0x020102, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x090109];

    // pause the manager and expect encode call to revert.
    await manager.pause();

    await expect(manager.encode(composableTokenId, layers)).to.be.revertedWith(
      "Pausable: paused"
    );

    // now unpased the contract and expect manager encode call to succeed.
    await manager.unpause();

    expect(await manager.encode(composableTokenId, layers))
      .to.emit(manager, "Compose")
      .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);
  });

  describe("Mananger Accessory Collections", function () {
    it("should update accessory collection", async function () {
      expect(await manager.accessoryAddressById(1)).to.equal(cbao.address);

      const newAddress = "0x4c5859f0F772848b2D91F1D83E2Fe57935348029";
      await manager.updateAccessoryAddress(1, newAddress);
      expect(await manager.accessoryAddressById(1)).to.equal(newAddress);

      // set a new address
      expect(await manager.accessoryAddressById(2)).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      await manager.updateAccessoryAddress(2, newAddress);
      expect(await manager.accessoryAddressById(2)).to.equal(newAddress);
    });
  });

  describe("IPacker read", function () {
    it("should encode the composable token id from layers", async function () {
      const composableTokenId = "0xffffffcc";
      const layers = [0x010101, 0, 0, 0, 0, 0, 0, 0, 0x090109];
      const expectedNewcomposableTokenId =
        "0x000101000000000000000000000000000000000000000000000901ffffffcc";

      const [baseTokenId, composableId] = await manager.encodeRead(
        composableTokenId,
        layers
      );
      expect(baseTokenId).to.equal("0xffffffcc");
      expect(composableId).to.equal(expectedNewcomposableTokenId);
    });

    it("should encode the composable token id from layers test2", async function () {
      const composableTokenId =
        "0x000000000000000000000000000000000000000000000000000901ffffffcc";

      const expectedNewcomposableTokenId =
        "0x000000000201000000000000000000000000000000000000000901ffffffcc";

      const layers = [0x0, 0x020102, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x090109];

      const [baseTokenId, composableId] = await manager.encodeRead(
        composableTokenId,
        layers
      );

      expect(baseTokenId).to.equal("0xffffffcc");
      expect(composableId).to.equal(expectedNewcomposableTokenId);
    });
  });

  describe("Mananger Encode/Decode composable token", function () {
    beforeEach(async () => {
      // add community accessories to manager
      await manager.updateAccessoryAddress(2, cbac.address);
    });

    it("should not do anything", async function () {
      // approve token transfer
      await cb.setApprovalForAll(manager.address, true);
      await cbao.setApprovalForAll(manager.address, true);
      await cbac.setApprovalForAll(manager.address, true);

      const composableTokenId =
        "0x000102000201000301000401000501000601000701000801000902ffffffcc";

      // mint composable token for a user
      await cb.mint(owner.address, composableTokenId, 1, []);
      const layers = [
        0x010201,
        0x020102,
        0x030103,
        0x040104,
        0x050105,
        0x060106,
        0x070107,
        0x080108,
        0x090209,
      ];

      expect(await manager.encode(composableTokenId, layers))
        .to.emit(manager, "Compose")
        .withArgs("0xffffffcc", layers, composableTokenId);
    });

    it("should remove layer from composable token and mint a new layer token from multiple collections", async function () {
      // This test sets 0 to a layer and expects contract to re-encode
      // composable token with removed layer AND mint a new layer to a user.

      // approve token transfer
      await cb.setApprovalForAll(manager.address, true);
      await cbao.setApprovalForAll(manager.address, true);
      await cbac.setApprovalForAll(manager.address, true);

      const composableTokenId =
        "0x000102000201000301000401000501000601000701000801000901ffffffcc";

      // mint composable token for a user
      await cb.mint(owner.address, composableTokenId, 1, []);

      // Layer 1 is set to 0 // from collection 2
      // Layer 9 is set to 0 // from collection 1
      const layers = [
        0x0,
        0x020102,
        0x030103,
        0x040104,
        0x050105,
        0x060106,
        0x070107,
        0x080108,
        0x0,
      ];

      // user does not have the accessory tokens
      expect(await cbac.balanceOf(owner.address, 0x010101)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

      const expectedNewcomposableTokenId =
        "0x000000000201000301000401000501000601000701000801000000ffffffcc";
      // re encode composable token id and mint a new accessory token
      expect(await manager.encode(composableTokenId, layers))
        .to.emit(manager, "Compose")
        .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

      // now user should have a tokens for the layer1, layer9
      expect(await cbac.balanceOf(owner.address, 0x010201)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

      // also now the user should have a different composable token
      // composableTokenId should be burned and a new composable tokenId without
      // layer1 should be minted
      expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

      expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

      expect(
        await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
      ).to.equal(1);
    });

    it("should remove all layers from composable token using different collections", async function () {
      // This test sets 0 to a layer and expects contract to re-encode
      // composable token with removed layer AND mint a new layer to a user.

      // approve token transfer
      await cb.setApprovalForAll(manager.address, true);
      await cbao.setApprovalForAll(manager.address, true);
      await cbac.setApprovalForAll(manager.address, true);

      const composableTokenId =
        "0x000102000201000302000401000501000601000701000801000901ffffffcc";

      // mint composable token for a user
      await cb.mint(owner.address, composableTokenId, 1, []);

      const layers = [0, 0, 0, 0, 0, 0, 0, 0, 0];

      // user does not have the accessory tokens
      expect(await cbac.balanceOf(owner.address, 0x010101)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x020102)).to.equal(0);
      expect(await cbac.balanceOf(owner.address, 0x030103)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x040104)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x050105)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x060106)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x070107)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x080108)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

      const expectedNewcomposableTokenId = "0xffffffcc";
      // re encode composable token id and mint a new accessory token
      expect(await manager.encode(composableTokenId, layers))
        .to.emit(manager, "Compose")
        .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

      // now user should have a all layer tokens
      expect(await cbac.balanceOf(owner.address, 0x010201)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x020102)).to.equal(1);
      expect(await cbac.balanceOf(owner.address, 0x030203)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x040104)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x050105)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x060106)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x070107)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x080108)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

      // also now the user should have a different composable token
      // composableTokenId should be burned and a new composable tokenId without
      // layer1 should be minted
      expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

      expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

      expect(
        await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
      ).to.equal(1);
    });

    it("should encode a new composable tokenId from layers using different collections", async function () {
      // approve token transfer
      await cb.setApprovalForAll(manager.address, true);
      await cbao.setApprovalForAll(manager.address, true);
      await cbac.setApprovalForAll(manager.address, true);

      const composableTokenId = "0xffffffcc";

      // mint composable token for a user
      await cb.mint(owner.address, composableTokenId, 1, []);

      // mint accessories
      await cbac.mint(owner.address, 0x010201, 1, []);
      await cbao.mint(owner.address, 0x090109, 1, []);

      expect(await cbac.balanceOf(owner.address, 0x010201)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

      const layers = [0x010201, 0, 0, 0, 0, 0, 0, 0, 0x090109];

      const expectedNewcomposableTokenId =
        "0x000102000000000000000000000000000000000000000000000901ffffffcc";

      // re encode composable token id and mint a new accessory token
      expect(await manager.encode(composableTokenId, layers))
        .to.emit(manager, "Compose")
        .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

      // accessory tokens must be burned
      expect(await cbac.balanceOf(owner.address, 0x010201)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

      expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

      expect(
        await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
      ).to.equal(1);
    });

    it("should re encode composable token id, burn user's accessory token and mint a new token from different collections", async function () {
      // approve token transfer
      await cb.setApprovalForAll(manager.address, true);
      await cbao.setApprovalForAll(manager.address, true);
      await cbac.setApprovalForAll(manager.address, true);

      const composableTokenId =
        "0x000102000000000000000000000000000000000000000000000901ffffffcc";

      // mint composable token for a user
      await cb.mint(owner.address, composableTokenId, 1, []);

      // mint accessories
      await cbac.mint(owner.address, 0x020201, 1, []);
      await cbao.mint(owner.address, 0x0a0109, 1, []);

      // minted accessories must be in user's wallet
      expect(await cbac.balanceOf(owner.address, 0x020201)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x0a0109)).to.equal(1);

      // the accessory token that we expect to swap
      expect(await cbac.balanceOf(owner.address, 0x010201)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(0);

      const layers = [0x020201, 0, 0, 0, 0, 0, 0, 0, 0x0a0109];

      const expectedNewcomposableTokenId =
        "0x000202000000000000000000000000000000000000000000000a01ffffffcc";
      // re encode composable token id and mint a new accessory token
      expect(await manager.encode(composableTokenId, layers))
        .to.emit(manager, "Compose")
        .withArgs("0xffffffcc", layers, expectedNewcomposableTokenId);

      // accessory tokens must be minted
      expect(await cbac.balanceOf(owner.address, 0x010201)).to.equal(1);
      expect(await cbao.balanceOf(owner.address, 0x090109)).to.equal(1);

      // accessory tokens must be burned
      expect(await cbac.balanceOf(owner.address, 0x020201)).to.equal(0);
      expect(await cbao.balanceOf(owner.address, 0x0a0109)).to.equal(0);
      expect(await cb.balanceOf(owner.address, composableTokenId)).to.equal(0);

      expect(
        await cb.balanceOf(owner.address, expectedNewcomposableTokenId)
      ).to.equal(1);
    });
  });

  describe("Mananger implements IPacker", async function () {
    const expectedLayers = [
      0x0,
      0x020102,
      0x030103,
      0x040104,
      0x050105,
      0x060106,
      0x070107,
      0x080108,
      0x0,
    ];

    const composableTokenId =
      "0x000000000201000301000401000501000601000701000801000000ffffffcc";

    const result = await manager.layersFromComposableId(composableTokenId);

    expect(result).to.be.equal(expectedLayers);
  });
});

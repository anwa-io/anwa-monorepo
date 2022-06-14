import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { CryptoBuddiesAccessoriesOfficial } from "../typechain-types";

describe("CryptoBuddiesAccessoriesOfficial", function () {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  let CryptoBuddiesAccessoriesOfficialFactory: ContractFactory;
  let cbao: CryptoBuddiesAccessoriesOfficial;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    CryptoBuddiesAccessoriesOfficialFactory = await ethers.getContractFactory(
      "CryptoBuddiesAccessoriesOfficial"
    );

    cbao = (await CryptoBuddiesAccessoriesOfficialFactory.deploy(
      "https://example.com/metadata/{id}.json"
    )) as CryptoBuddiesAccessoriesOfficial;

    await cbao.deployed();
  });

  it("Should deploy CryptoBuddiesAccessoriesOfficial with uri from constructor", async function () {
    expect(await cbao.name()).to.equal("Crypto Buddies Accessories Official");
    expect(await cbao.symbol()).to.equal("CBAO1");
    expect(await cbao.uri(0)).to.equal(
      "https://example.com/metadata/{id}.json"
    );
  });

  it("Should update token uri for a given token id", async function () {
    // should be the URI from constructor
    expect(await cbao.uri(0)).to.equal(
      "https://example.com/metadata/{id}.json"
    );
    expect(await cbao.uri(1)).to.equal(
      "https://example.com/metadata/{id}.json"
    );

    // update uri for token id 0
    await cbao.setUri(0, "ipvs://xyz");

    // token id 0 should have a different URI
    expect(await cbao.uri(0)).to.equal("ipvs://xyz");

    // token id 1 should still point to URI from constructor
    expect(await cbao.uri(1)).to.equal(
      "https://example.com/metadata/{id}.json"
    );
  });

  it("Should update default URI", async function () {
    // should be the URI from constructor
    expect(await cbao.uri(0)).to.equal(
      "https://example.com/metadata/{id}.json"
    );
    expect(await cbao.uri(1)).to.equal(
      "https://example.com/metadata/{id}.json"
    );

    // update uri for token id 0
    await cbao.setUri(0, "ipvs://xyz");

    // update default URI for all other token IDs
    await cbao.setDefaultUri("https://newserver.com/metadata/{id}.json");

    // token id 0 should have a different URI
    expect(await cbao.uri(0)).to.equal("ipvs://xyz");

    // token id 1 should point to a new URI
    expect(await cbao.uri(1)).to.equal(
      "https://newserver.com/metadata/{id}.json"
    );
  });

  it("Should not update URI when paused", async function () {
    // pause the contract
    await cbao.pause();

    // we should not be able to update uri
    await expect(cbao.setUri(0, "ipvs://xyz")).to.be.revertedWith(
      "Pausable: paused"
    );
    await expect(cbao.setDefaultUri("aabbcc")).to.be.revertedWith(
      "Pausable: paused"
    );

    // unpause the contact
    await cbao.unpause();

    // now update URI should start working again
    await cbao.setUri(0, "ipvs://xyz");
    await cbao.setDefaultUri("aabbcc");

    expect(await cbao.uri(0)).to.equal("ipvs://xyz");

    // token id 1 should point to a new URI
    expect(await cbao.uri(1)).to.equal("aabbcc");
  });
});

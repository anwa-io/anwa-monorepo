import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { CryptoBuddies } from "../typechain-types";

describe("CryptoBuddies", function () {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  let CryptoBuddiesFactory: ContractFactory;
  let cb: CryptoBuddies;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    CryptoBuddiesFactory = await ethers.getContractFactory("CryptoBuddies");

    cb = (await CryptoBuddiesFactory.deploy(
      "https://example.com/metadata/{id}.json"
    )) as CryptoBuddies;

    await cb.deployed();
  });

  it("Should deploy CryptoBuddies with uri from constructor", async function () {
    expect(await cb.name()).to.equal("Crypto Buddies");
    expect(await cb.symbol()).to.equal("CB");
    expect(await cb.uri(0)).to.equal("https://example.com/metadata/{id}.json");
  });

  it("Should update token uri for a given token id", async function () {
    // should be the URI from constructor
    expect(await cb.uri(0)).to.equal("https://example.com/metadata/{id}.json");
    expect(await cb.uri(1)).to.equal("https://example.com/metadata/{id}.json");

    // update uri for token id 0
    await cb.setUri(0, "ipvs://xyz");

    // token id 0 should have a different URI
    expect(await cb.uri(0)).to.equal("ipvs://xyz");

    // token id 1 should still point to URI from constructor
    expect(await cb.uri(1)).to.equal("https://example.com/metadata/{id}.json");
  });

  it("Should update default URI", async function () {
    // should be the URI from constructor
    expect(await cb.uri(0)).to.equal("https://example.com/metadata/{id}.json");
    expect(await cb.uri(1)).to.equal("https://example.com/metadata/{id}.json");

    // update uri for token id 0
    await cb.setUri(0, "ipvs://xyz");

    // update default URI for all other token IDs
    await cb.setDefaultUri("https://newserver.com/metadata/{id}.json");

    // token id 0 should have a different URI
    expect(await cb.uri(0)).to.equal("ipvs://xyz");

    // token id 1 should point to a new URI
    expect(await cb.uri(1)).to.equal(
      "https://newserver.com/metadata/{id}.json"
    );
  });

  it("Should not update URI when paused", async function () {
    // pause the contract
    await cb.pause();

    // we should not be able to update uri
    await expect(cb.setUri(0, "ipvs://xyz")).to.be.revertedWith(
      "Pausable: paused"
    );
    await expect(cb.setDefaultUri("aabbcc")).to.be.revertedWith(
      "Pausable: paused"
    );

    // unpause the contact
    await cb.unpause();

    // now update URI should start working again
    await cb.setUri(0, "ipvs://xyz");
    await cb.setDefaultUri("aabbcc");

    expect(await cb.uri(0)).to.equal("ipvs://xyz");

    // token id 1 should point to a new URI
    expect(await cb.uri(1)).to.equal("aabbcc");
  });

  it("Should deploy without default uri and add individual uri for tokens", async function () {
    const CryptoBuddiesFactory2 = await ethers.getContractFactory(
      "CryptoBuddies"
    );

    const cb2 = (await CryptoBuddiesFactory2.deploy("")) as CryptoBuddies;

    await cb2.deployed();

    // tokens ids 0, 1 should have a different URI
    expect(await cb2.uri(0)).to.equal("");
    expect(await cb2.uri(1)).to.equal("");

    // mint a token
    await cb2.mint(owner.address, 0, 1, []);

    await cb2.setUri(0, "https://uri");

    // tokens ids 0, 1 should have a different URI
    expect(await cb2.uri(0)).to.equal("https://uri");
    expect(await cb2.uri(1)).to.equal("");
  });
});

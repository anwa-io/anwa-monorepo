import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { CryptoBuddiesMembership } from "../typechain-types";

describe("CryptoBuddiesMembership", function () {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  let CryptoBuddiesMembershipFactory: ContractFactory;
  let cbm: CryptoBuddiesMembership;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    CryptoBuddiesMembershipFactory = await ethers.getContractFactory(
      "CryptoBuddiesMembership"
    );

    cbm = (await CryptoBuddiesMembershipFactory.deploy(
      100,
      addr1.address,
      "https://example.com/img/test.json"
    )) as CryptoBuddiesMembership;

    await cbm.deployed();
  });

  it("Should mint membership tokens to redeemable address", async function () {
    expect(await cbm.name()).to.equal("CryptoBuddies Membership");
    expect(await cbm.symbol()).to.equal("CBM");
    expect(await cbm.totalSupply()).to.equal(100);
    expect(await cbm.balanceOf(addr1.address)).to.eq(100);
    expect(await cbm.tokenURI(0)).to.equal("https://example.com/img/test.json");
  });

  it("Should change the URI", async function () {
    expect(await cbm.tokenURI(0)).to.equal("https://example.com/img/test.json");
    expect(await cbm.tokenURI(99)).to.equal(
      "https://example.com/img/test.json"
    );

    await cbm.updateTokenURI("https://example.com/img/test2.json");

    expect(await cbm.tokenURI(0)).to.equal(
      "https://example.com/img/test2.json"
    );
    expect(await cbm.tokenURI(99)).to.equal(
      "https://example.com/img/test2.json"
    );
  });

  it("Should not allow change URI to non-owner", async function () {
    await expect(
      cbm
        .connect(addr1.address)
        .updateTokenURI("https://example.com/img/test2.json")
    ).to.be.reverted;
  });

  it("Should throw an error if tokenURI method gets wrong token", async function () {
    await expect(cbm.tokenURI(100)).to.be.revertedWith(
      "URI query for nonexistent token"
    );
  });
});

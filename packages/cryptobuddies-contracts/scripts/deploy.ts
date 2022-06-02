// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  if (process.env.CRYPTO_BUDDIES_MINT_PASS == "true") {
    console.log("Deploying CryptoBuddiesMintPass");
    const CryptoBuddiesMintPass = await ethers.getContractFactory(
      "CryptoBuddiesMintPass"
    );
    const mintPass = await CryptoBuddiesMintPass.deploy(
      process.env.CRYPTO_BUDDIES_MINT_PASS_REDEEMABLE_ADDRESS,
      process.env.CRYPTO_BUDDIES_MINT_PASS_IMAGE
    );

    await mintPass.deployed();

    console.log("CryptoBuddiesMintPass deployed to:", mintPass.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

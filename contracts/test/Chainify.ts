import { expect } from "chai";
import { network } from "hardhat";

describe("Chainify Contracts", function () {
  async function deployContractsFixture() {
    const connection = await network.getOrCreate();
    const { ethers } = connection;

    // Deploy Library
    const ZKTranscriptLib = await ethers.getContractFactory("ZKTranscriptLib");
    const zkTranscriptLib = await ZKTranscriptLib.deploy();
    const zkTranscriptLibAddress = await zkTranscriptLib.getAddress();

    // Deploy Verifier
    const Verifier = await ethers.getContractFactory("HonkVerifier", {
      libraries: {
        ZKTranscriptLib: zkTranscriptLibAddress,
      },
    });
    const verifier = await Verifier.deploy();
    const verifierAddress = await verifier.getAddress();

    // Deploy Roles
    const Roles = await ethers.getContractFactory("Roles");
    const roles = await Roles.deploy(verifierAddress);
    const rolesAddress = await roles.getAddress();

    // Deploy Product
    const Product = await ethers.getContractFactory("product");
    const product = await Product.deploy(rolesAddress);

    return { product, roles, verifier };
  }

  it("Should deploy all contracts correctly", async function () {
    const { product, roles, verifier } = await deployContractsFixture();
    expect(await product.getAddress()).to.be.properAddress;
    expect(await roles.getAddress()).to.be.properAddress;
    expect(await verifier.getAddress()).to.be.properAddress;
  });

  it("Should have correct owner for Roles contract", async function () {
    const { roles } = await deployContractsFixture();
    const connection = await network.getOrCreate();
    const [owner] = await connection.ethers.getSigners();
    expect(await roles.owner()).to.equal(owner.address);
  });
});

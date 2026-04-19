import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment to local blockchain...");

  // 1. Deploy the ZK Verifier Contract
  const Verifier = await ethers.getContractFactory("HonkVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`✅ HonkVerifier deployed to: ${verifierAddress}`);

  const Roles = await ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(verifierAddress);
  await roles.waitForDeployment();
  const rolesAddress = await roles.getAddress();
  console.log(`✅ Roles deployed to: ${rolesAddress}`);

  const Product = await ethers.getContractFactory("product");
  const product = await Product.deploy(rolesAddress);
  await product.waitForDeployment();
  const productAddress = await product.getAddress();
  console.log(`✅ Product deployed to: ${productAddress}`);

  console.log("\n🎉 All contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
import { network } from "hardhat";

async function main() {
  console.log("Starting deployment of product.sol...");
  const connection = await network.getOrCreate();
  const { ethers } = connection;

  const rolesAddress = "0xDA27b656bc9f86B705d3d033023Cb50183A050F6";

  // Deploy Product contract
  const Product = await ethers.getContractFactory("product");
  const product = await Product.deploy(rolesAddress);
  await product.waitForDeployment();
  const productAddress = await product.getAddress();
  console.log(`✅ Product deployed to: ${productAddress}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

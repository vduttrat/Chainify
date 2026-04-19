import { network } from "hardhat";

async function main() {
  console.log("Starting deployment to local blockchain...");

  const connection = await network.getOrCreate();
  const { ethers } = connection;

  // 1. Deploy the ZKTranscriptLib library (required by HonkVerifier)
  const ZKTranscriptLib = await ethers.getContractFactory("ZKTranscriptLib");
  const zkTranscriptLib = await ZKTranscriptLib.deploy();
  await zkTranscriptLib.waitForDeployment();
  const zkTranscriptLibAddress = await zkTranscriptLib.getAddress();
  console.log(`✅ ZKTranscriptLib deployed to: ${zkTranscriptLibAddress}`);

  // 2. Deploy the HonkVerifier contract (linked with ZKTranscriptLib)
  const Verifier = await ethers.getContractFactory("HonkVerifier", {
    libraries: {
      ZKTranscriptLib: zkTranscriptLibAddress,
    },
  });
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`✅ HonkVerifier deployed to: ${verifierAddress}`);

  // 3. Deploy Roles contract
  const Roles = await ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(verifierAddress);
  await roles.waitForDeployment();
  const rolesAddress = await roles.getAddress();
  console.log(`✅ Roles deployed to: ${rolesAddress}`);

  // 4. Deploy Product contract
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
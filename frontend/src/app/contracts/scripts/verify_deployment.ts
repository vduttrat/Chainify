import { network } from "hardhat";

const { ethers } = await network.create();

async function verify() {
  console.log("Verifying deployment logic...");

  // Deploy Lib
  const ZKTranscriptLib = await ethers.getContractFactory("ZKTranscriptLib");
  const zkTranscriptLib = await ZKTranscriptLib.deploy();
  await zkTranscriptLib.waitForDeployment();
  const libAddr = await zkTranscriptLib.getAddress();
  
  // Deploy Verifier
  const Verifier = await ethers.getContractFactory("HonkVerifier", {
    libraries: { ZKTranscriptLib: libAddr },
  });
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();

  // Deploy Roles
  const Roles = await ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(verifierAddr);
  await roles.waitForDeployment();
  const rolesAddr = await roles.getAddress();

  // Deploy Product
  const Product = await ethers.getContractFactory("product");
  const product = await Product.deploy(rolesAddr);
  await product.waitForDeployment();
  const productAddr = await product.getAddress();

  console.log("\nDeployment Results:");
  const addresses = {
    ZKTranscriptLib: libAddr,
    HonkVerifier: verifierAddr,
    Roles: rolesAddr,
    Product: productAddr
  };

  for (const [name, addr] of Object.entries(addresses)) {
    const code = await ethers.provider.getCode(addr);
    if (code !== "0x") {
      console.log(`✅ ${name} verified at ${addr} (Code size: ${code.length / 2 - 1} bytes)`);
    } else {
      console.log(`❌ ${name} verification FAILED at ${addr}`);
    }
  }
}

verify().catch(console.error);

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("--------------------------------------------------");
  console.log("CertiChain Smart Contract Deployment");
  console.log("--------------------------------------------------");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
  const contract = await CertificateRegistryFactory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`CertificateRegistry successfully deployed to: ${contractAddress}`);

  // Save deployment artifact for backend consumption
  const deploymentInfo = {
    address: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);

  // Also export ABI directly for backend use
  const artifactPath = path.join(__dirname, "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const abiExportPath = path.join(deploymentsDir, "CertificateRegistry.abi.json");
    fs.writeFileSync(abiExportPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`ABI exported to: ${abiExportPath}`);
  }

  console.log("--------------------------------------------------");
  console.log("Deployment completed successfully.");
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

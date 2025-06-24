const fs = require('fs');
const path = require('path');

async function main() {
  console.log("📄 Exporting ReviewNFT ABI...");
  
  // Read the compiled artifact
  const artifactPath = path.join(__dirname, '../artifacts/contracts/ReviewNFT.sol/ReviewNFT.json');
  
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ ReviewNFT artifact not found. Run 'npm run compile' first.");
    process.exit(1);
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Extract ABI
  const abi = artifact.abi;
  
  // Save ABI to frontend src/lib directory
  const frontendAbiPath = path.join(__dirname, '../../src/lib/ReviewNFT-abi.ts');
  
  const abiContent = `// ReviewNFT Smart Contract ABI
// Auto-generated on ${new Date().toISOString()}

export const REVIEW_NFT_ABI = ${JSON.stringify(abi, null, 2)} as const;

export type ReviewNFTABI = typeof REVIEW_NFT_ABI;
`;
  
  // Ensure the directory exists
  const frontendLibDir = path.dirname(frontendAbiPath);
  if (!fs.existsSync(frontendLibDir)) {
    fs.mkdirSync(frontendLibDir, { recursive: true });
  }
  
  fs.writeFileSync(frontendAbiPath, abiContent);
  
  console.log("✅ ReviewNFT ABI exported successfully!");
  console.log(`📄 Frontend ABI: ${frontendAbiPath}`);
  console.log(`📊 ABI contains ${abi.length} functions/events`);
  
  // Also save a simple JSON version
  const jsonAbiPath = path.join(__dirname, '../ReviewNFT-abi.json');
  fs.writeFileSync(jsonAbiPath, JSON.stringify(abi, null, 2));
  console.log(`📄 JSON ABI: ${jsonAbiPath}`);
}

main()
  .then(() => {
    console.log("\n✅ ReviewNFT ABI export completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ ReviewNFT ABI export failed:", error);
    process.exit(1);
  });
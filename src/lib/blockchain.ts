import { ethers } from 'ethers';

// Zlto ERC-20 Token ABI (minimal)
export const ZLTO_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event CredentialIssued(address indexed user, bytes32 credentialHash, uint256 zltoAmount)",
  "event TreeVerified(address indexed user, bytes32 treeHash, uint256 zltoAmount)",
  "event EscrowCreated(uint256 indexed gigId, address employer, uint256 amount)",
  "event EscrowReleased(uint256 indexed gigId, address worker, uint256 amount)",
];

// Base Sepolia Testnet config
export const CHAIN_CONFIG = {
  chainId: 84532,
  chainName: 'Base Sepolia Testnet',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  // This would be the deployed contract address - placeholder for POC
  zltoContractAddress: '0x0000000000000000000000000000000000000000',
};

export const getProvider = () => {
  return new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
};

// Generate a deterministic wallet from user's Supabase ID (for POC only)
export const generateWalletFromUserId = (userId: string): ethers.Wallet => {
  const hash = ethers.id(userId);
  const wallet = new ethers.Wallet(hash);
  return wallet;
};

// Create credential hash for on-chain storage
export const createCredentialHash = (userId: string, courseId: string, timestamp: number): string => {
  return ethers.solidityPackedKeccak256(
    ['string', 'string', 'uint256'],
    [userId, courseId, timestamp]
  );
};

// Create tree verification hash
export const createTreeHash = (userId: string, lat: number, lng: number, timestamp: number): string => {
  return ethers.solidityPackedKeccak256(
    ['string', 'int256', 'int256', 'uint256'],
    [userId, Math.round(lat * 1e6), Math.round(lng * 1e6), timestamp]
  );
};

// Simulate a blockchain transaction (for POC - returns mock tx hash)
export const simulateTransaction = async (type: string, data: any): Promise<string> => {
  // In production, this would interact with the actual smart contract
  // For POC, generate a realistic-looking tx hash
  const nonce = Date.now();
  const hash = ethers.id(`${type}:${JSON.stringify(data)}:${nonce}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return hash;
};

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const shortenTxHash = (hash: string): string => {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
};

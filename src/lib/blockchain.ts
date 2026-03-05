import { ethers } from 'ethers';

// Sigma ERC-20 Token ABI (minimal for interactions)
export const SIGMA_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event CredentialIssued(address indexed user, bytes32 credentialHash, uint256 sigmaAmount)",
  "event TreeVerified(address indexed user, bytes32 treeHash, uint256 sigmaAmount)",
  "event EscrowCreated(uint256 indexed gigId, address employer, uint256 amount)",
  "event EscrowReleased(uint256 indexed gigId, address worker, uint256 amount)",
];

// Base Sepolia Testnet config
export const CHAIN_CONFIG = {
  chainId: 84532,
  chainName: 'Base Sepolia Testnet',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
};

export const getProvider = () => {
  return new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
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

export const shortenAddress = (address: string): string => {
  if (!address) return '—';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const shortenTxHash = (hash: string): string => {
  if (!hash) return '—';
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
};

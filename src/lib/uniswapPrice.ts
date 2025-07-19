import { WebSocketProvider, Interface, Log } from 'ethers';

// Uniswap V3 ETH/USDC pool address
const UNISWAP_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

// Minimal ABI for Swap event
const SWAP_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
];

const iface = new Interface(SWAP_ABI);
const SWAP_TOPIC = iface.getEvent('Swap')?.format();

// Helper to get the latest sqrtPriceX96 from Swap events
// NOTE: Your tsconfig must target ES2020 or higher for BigInt support
export async function fetchLatestEthUsdPrice(provider: WebSocketProvider): Promise<number | null> {
  // Get recent logs (last 1000 blocks)
  const latestBlock = await provider.getBlockNumber();
  const logs: Log[] = await provider.getLogs({
    address: UNISWAP_POOL,
    fromBlock: latestBlock - 1000,
    toBlock: latestBlock,
    topics: SWAP_TOPIC ? [SWAP_TOPIC] : undefined,
  });
  if (!logs.length) return null;
  // Get the last Swap event
  const lastLog = logs[logs.length - 1];
  const parsed = iface.parseLog(lastLog);
  if (!parsed) return null;
  const sqrtPriceX96 = BigInt(parsed.args.sqrtPriceX96);
  // Calculate price using formula: price = (sqrtPriceX96**2 * 10**12) / (2**192)
  const price = Number((sqrtPriceX96 * sqrtPriceX96 * 10n ** 12n) / (2n ** 192n)) / 1e6; // USDC has 6 decimals
  return price;
} 
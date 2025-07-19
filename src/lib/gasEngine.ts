import { WebSocketProvider, formatUnits } from 'ethers';
import { useGasStore, Chain } from '../store/useGasStore';

// Replace with your own WebSocket endpoints
const RPC_URLS: Record<Chain, string> = {
  ethereum: 'wss://mainnet.infura.io/ws/v3/YOUR_INFURA_KEY',
  polygon: 'wss://polygon-rpc.com', // Replace with a real Polygon WSS endpoint
  arbitrum: 'wss://arb1.arbitrum.io/ws',
};



const providers: Partial<Record<Chain, WebSocketProvider>> = {};
const lastBlock: Partial<Record<Chain, number>> = {};

export function startGasEngine() {
  (['ethereum', 'polygon', 'arbitrum'] as Chain[]).forEach((chain) => {
    if (providers[chain]) return; // Already started
    const provider = new WebSocketProvider(RPC_URLS[chain]);
    providers[chain] = provider;
    provider.on('block', async (blockNumber: number) => {
      if (lastBlock[chain] === blockNumber) return;
      lastBlock[chain] = blockNumber;
      const block = await provider.getBlock(blockNumber);
      if (!block) return;
      let baseFee = 0;
      let priorityFee = 0;
      if (chain === 'ethereum' || chain === 'arbitrum') {
        baseFee = Number(formatUnits(block.baseFeePerGas || 0, 'gwei'));
        // Estimate priority fee (EIP-1559)
        try {
          const fee = await provider.send('eth_maxPriorityFeePerGas', []);
          priorityFee = Number(formatUnits(fee, 'gwei'));
        } catch {
          priorityFee = 2; // fallback
        }
      } else if (chain === 'polygon') {
        // Polygon doesn't use EIP-1559 everywhere, fallback to gasPrice
        baseFee = Number(formatUnits(block.gasLimit, 'gwei'));
        try {
          const gasPrice = await provider.send('eth_gasPrice', []);
          priorityFee = Number(formatUnits(gasPrice, 'gwei')) - baseFee;
        } catch {
          priorityFee = 1;
        }
      }
      useGasStore.getState().updateGas(chain, baseFee, priorityFee);
      useGasStore.getState().addGasHistory(chain, {
        timestamp: Date.now(),
        baseFee,
        priorityFee,
      });
    });
  });
}

export { providers }; 
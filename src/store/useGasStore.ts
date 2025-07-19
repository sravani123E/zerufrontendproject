import { create } from 'zustand';

export type Chain = 'ethereum' | 'polygon' | 'arbitrum';

export type GasPoint = {
  timestamp: number; // ms
  baseFee: number; // gwei
  priorityFee: number; // gwei
};

export type ChainGasState = {
  baseFee: number;
  priorityFee: number;
  history: GasPoint[];
};

export type GasStore = {
  mode: 'live' | 'simulation';
  chains: Record<Chain, ChainGasState>;
  usdPrice: number; // ETH/USD
  simulation: {
    inputAmount: number; // ETH/MATIC/ETH
    inputChain: Chain;
  };
  setMode: (mode: 'live' | 'simulation') => void;
  updateGas: (chain: Chain, baseFee: number, priorityFee: number) => void;
  addGasHistory: (chain: Chain, point: GasPoint) => void;
  setUsdPrice: (price: number) => void;
  setSimulation: (inputAmount: number, inputChain: Chain) => void;
};

const initialChainState: ChainGasState = {
  baseFee: 0,
  priorityFee: 0,
  history: [],
};

export const useGasStore = create<GasStore>((set) => ({
  mode: 'live',
  chains: {
    ethereum: { ...initialChainState },
    polygon: { ...initialChainState },
    arbitrum: { ...initialChainState },
  },
  usdPrice: 0,
  simulation: {
    inputAmount: 0,
    inputChain: 'ethereum',
  },
  setMode: (mode) => set({ mode }),
  updateGas: (chain, baseFee, priorityFee) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          baseFee,
          priorityFee,
        },
      },
    })),
  addGasHistory: (chain, point) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          history: [...state.chains[chain].history, point],
        },
      },
    })),
  setUsdPrice: (usdPrice) => set({ usdPrice }),
  setSimulation: (inputAmount, inputChain) =>
    set((state) => ({
      simulation: { inputAmount, inputChain },
      mode: 'simulation',
    })),
})); 
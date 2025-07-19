import { useState } from 'react';
import { useGasStore, Chain } from '../store/useGasStore';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button } from '@mui/material';

const CHAIN_LABELS: Record<Chain, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
};

const GAS_LIMIT = 21000; // Standard ETH transfer

export default function SimulationTable() {
  const { chains, usdPrice, simulation, setSimulation, mode, setMode } = useGasStore();
  const [inputAmount, setInputAmount] = useState(simulation.inputAmount);
  const [inputChain, setInputChain] = useState<Chain>(simulation.inputChain);

  const handleSimulate = () => {
    setSimulation(inputAmount, inputChain);
    setMode('simulation');
  };

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <h2>Simulation Mode</h2>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <TextField
          label="Amount"
          type="number"
          value={inputAmount}
          onChange={e => setInputAmount(Number(e.target.value))}
          inputProps={{ min: 0, step: 'any' }}
        />
        <Select value={inputChain} onChange={e => setInputChain(e.target.value as Chain)}>
          {Object.entries(CHAIN_LABELS).map(([k, v]) => (
            <MenuItem value={k} key={k}>{v}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={handleSimulate}>Simulate</Button>
        <Button variant="outlined" onClick={() => setMode('live')} disabled={mode === 'live'}>Live Mode</Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chain</TableCell>
              <TableCell>Base Fee (gwei)</TableCell>
              <TableCell>Priority Fee (gwei)</TableCell>
              <TableCell>Gas Cost (USD)</TableCell>
              <TableCell>Total Cost (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(Object.entries(chains) as [Chain, typeof chains[Chain]][]).map(([chain, data]) => {
              const gasCostUsd = (data.baseFee + data.priorityFee) * 1e-9 * GAS_LIMIT * usdPrice;
              const txCostUsd = inputAmount * usdPrice;
              const totalCost = gasCostUsd + txCostUsd;
              return (
                <TableRow key={chain}>
                  <TableCell>{CHAIN_LABELS[chain]}</TableCell>
                  <TableCell>{data.baseFee.toFixed(2)}</TableCell>
                  <TableCell>{data.priorityFee.toFixed(2)}</TableCell>
                  <TableCell>${gasCostUsd.toFixed(2)}</TableCell>
                  <TableCell>${totalCost.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 
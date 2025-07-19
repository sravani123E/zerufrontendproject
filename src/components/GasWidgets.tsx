import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useGasStore, Chain } from '../store/useGasStore';

const CHAIN_LABELS: Record<Chain, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
};

export default function GasWidgets() {
  const chains = useGasStore((s) => s.chains);
  const usdPrice = useGasStore((s) => s.usdPrice);
  return (
    <Grid container spacing={2}>
      {(Object.entries(chains) as [Chain, typeof chains[Chain]][]).map(([chain, data]) => (
        <Grid size={{ xs: 12, sm: 4 }} key={chain}>
          <Card>
            <CardContent>
              <Typography variant="h6">{CHAIN_LABELS[chain]}</Typography>
              <Typography>Base Fee: {data.baseFee.toFixed(2)} gwei</Typography>
              <Typography>Priority Fee: {data.priorityFee.toFixed(2)} gwei</Typography>
              {chain === 'ethereum' && (
                <Typography>Base Fee (USD): ${(data.baseFee * 1e-9 * 21000 * usdPrice).toFixed(2)}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 
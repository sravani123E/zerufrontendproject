"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { startGasEngine, providers } from "../lib/gasEngine";
import { fetchLatestEthUsdPrice } from "../lib/uniswapPrice";
import { useGasStore, Chain } from "../store/useGasStore";
import GasWidgets from "../components/GasWidgets";
import GasChart from "../components/GasChart";
import SimulationTable from "../components/SimulationTable";
import { Button, ToggleButton, ToggleButtonGroup, Paper } from "@mui/material";

const CHAIN_LABELS: Record<Chain, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
};

export default function Home() {
  const setUsdPrice = useGasStore((s) => s.setUsdPrice);
  const mode = useGasStore((s) => s.mode);
  const setMode = useGasStore((s) => s.setMode);
  const [selectedChain, setSelectedChain] = useState<Chain>("ethereum");

  useEffect(() => {
    startGasEngine();
    let stopped = false;
    async function pollPrice() {
      const provider = providers.ethereum;
      if (!provider) return;
      const price = await fetchLatestEthUsdPrice(provider);
      if (price && !stopped) setUsdPrice(price);
    }
    const interval = setInterval(pollPrice, 10000);
    pollPrice();
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [setUsdPrice]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Cross-Chain Gas Price Tracker</h1>
        <GasWidgets />
        <Paper sx={{ mt: 4, p: 2 }}>
          <ToggleButtonGroup
            value={selectedChain}
            exclusive
            onChange={(_, v) => v && setSelectedChain(v)}
            sx={{ mb: 2 }}
          >
            {Object.entries(CHAIN_LABELS).map(([k, v]) => (
              <ToggleButton value={k} key={k}>{v}</ToggleButton>
            ))}
          </ToggleButtonGroup>
          <GasChart chain={selectedChain} />
        </Paper>
        {mode === "simulation" && <SimulationTable />}
        {mode === "live" && (
          <Button sx={{ mt: 4 }} variant="outlined" onClick={() => setMode("simulation")}>Enter Simulation Mode</Button>
        )}
      </main>
    </div>
  );
}

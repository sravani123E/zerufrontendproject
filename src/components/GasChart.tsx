import { useEffect, useRef } from 'react';
import { createChart, CandlestickData, IChartApi, Time, ISeriesApi } from 'lightweight-charts';
import { useGasStore, Chain } from '../store/useGasStore';

function aggregateCandles(history: { timestamp: number; baseFee: number }[], intervalMs: number): CandlestickData[] {
  if (!history.length) return [];
  const candles: CandlestickData[] = [];
  let start = history[0].timestamp - (history[0].timestamp % intervalMs);
  let open = history[0].baseFee;
  let high = open;
  let low = open;
  let close = open;
  for (let i = 0; i < history.length; ++i) {
    const { timestamp, baseFee } = history[i];
    if (timestamp >= start + intervalMs) {
      candles.push({
        time: Math.floor(start / 1000) as Time,
        open, high, low, close,
      });
      start += intervalMs;
      open = baseFee;
      high = baseFee;
      low = baseFee;
      close = baseFee;
    } else {
      if (baseFee > high) high = baseFee;
      if (baseFee < low) low = baseFee;
      close = baseFee;
    }
  }
  candles.push({ time: Math.floor(start / 1000) as Time, open, high, low, close });
  return candles;
}

export default function GasChart({ chain }: { chain: Chain }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const history = useGasStore((s) => s.chains[chain].history);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = createChart(chartRef.current, { height: 300 });
      seriesRef.current = chartInstance.current.addCandlestickSeries({});
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      const candles = aggregateCandles(history, 15 * 60 * 1000);
      seriesRef.current.setData(candles);
    }
  }, [history]);

  return <div ref={chartRef} style={{ width: '100%', height: 300 }} />;
}
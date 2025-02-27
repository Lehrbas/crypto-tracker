"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import { useCoinList } from "@/app/hooks/useCoinList";
import { useCoinHistory } from "@/app/hooks/useCoinHistory";
import { RealTimeLineChart } from "@/app/components/d3/RealTimeLineChart";
import { StaticLineChart } from "@/app/components/d3/StaticLineChart";
import Spinner from "./components/shared/Spinner";
import Button from "./components/shared/Button";
import { CoinOption } from "./types/coin";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Home() {
  const {
    coinOptionList,
    error: coinListError,
    loading: coinListLoading,
  } = useCoinList();
  const [selectedCoin, setSelectedCoin] = useState<CoinOption | null>(null);
  const [chartMode, setChartMode] = useState<"real-time" | "static">(
    "real-time"
  );
  const dateRanges = useMemo(
    () => [
      { value: 1, label: "1 Day" },
      { value: 7, label: "7 Days" },
      { value: 30, label: "30 Days" },
    ],
    []
  );
  const [selectedDateRange, setSelectedDateRange] = useState(dateRanges[2]);

  const {
    priceHistory,
    error: historyError,
    loading: historyLoading,
  } = useCoinHistory(selectedCoin, selectedDateRange.value);

  const handleCoinSelectChange = useCallback((newValue: unknown) => {
    setSelectedCoin(newValue as CoinOption);
  }, []);

  const handleDateRangeChange = useCallback((newValue: any) => {
    setSelectedDateRange(newValue);
  }, []);

  const options: CoinOption[] = useMemo(
    () =>
      coinOptionList.map((crypto) => ({
        value: crypto.id,
        label: `${crypto.name} (${crypto.symbol.toUpperCase()})`,
      })),
    [coinOptionList]
  );

  return (
    <div className={`container`}>
      <h1>Coin Tracker</h1>

      {chartMode === "static" && (
        <Select
          options={dateRanges}
          value={selectedDateRange}
          onChange={handleDateRangeChange}
          placeholder="Select date range"
        />
      )}

      {coinListLoading ? (
        <Spinner />
      ) : (
        <Select
          options={options}
          onChange={handleCoinSelectChange}
          placeholder="Select crypto"
        />
      )}

      {coinListError && <p style={{ color: "red" }}>{coinListError}</p>}

      {selectedCoin && (
        <div>
          <h2>{selectedCoin.label}</h2>
          <Button
            onClick={() =>
              setChartMode(chartMode === "real-time" ? "static" : "real-time")
            }
          >
            {chartMode === "real-time"
              ? "Switch to Static Chart"
              : "Switch to Real-Time Chart"}
          </Button>

          <div className="chart-container">
            {historyLoading ? (
              <Spinner />
            ) : chartMode === "real-time" ? (
              <RealTimeLineChart selectedCoin={selectedCoin} />
            ) : (
              <StaticLineChart data={priceHistory} />
            )}

            {historyError && <p style={{ color: "red" }}>{historyError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

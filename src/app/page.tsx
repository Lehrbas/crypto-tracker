"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { RealTimeLineChart } from "@/app/components/d3/RealTimeLineChart";
import { StaticLineChart } from "@/app/components/d3/StaticLineChart";
import { getCoinList, getCoinHistory } from "@/server/api";
import Spinner from "./components/shared/Spinner";
import { CoinOption, Coin, PriceData } from "./types/coin";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Home() {
  const [coinOptionList, setCoinOptionList] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinOption | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<"real-time" | "static">(
    "real-time"
  );

  const dateRanges = [
    { value: 1, label: "1 Day" },
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
  ];

  const [selectedDateRange, setSelectedDateRange] = useState(dateRanges[2]);

  useEffect(() => {
    const fetchCoinList = async () => {
      setLoading(true);
      try {
        const data: Coin[] = await getCoinList();
        setCoinOptionList(data);
      } catch (err) {
        console.log(err);
        setError("Failed to load cryptocurrency list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoinList();
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      const fetchCoinHistory = async () => {
        setLoading(true);
        try {
          const data: PriceData[] = await getCoinHistory(
            selectedCoin.value as string,
            selectedDateRange.value as number
          );
          setPriceHistory(data);
          setError("");
        } catch (err) {
          setError("Failed to load price history. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchCoinHistory();
    }
  }, [selectedCoin, selectedDateRange]);

  const handleCoinSelectChange = useCallback(
    (newValue: unknown) => {
      if (newValue) {
        setSelectedCoin(newValue as CoinOption);
      } else {
        setSelectedCoin(null);
      }
    },
    [selectedCoin]
  );

  const handleDateRangeChange = (newValue: any) => {
    if (newValue) {
      setSelectedDateRange(newValue);
    }
  };

  const options: CoinOption[] = coinOptionList.map((crypto) => ({
    value: crypto.id,
    label: `${crypto.name} (${crypto.symbol.toUpperCase()})`,
  }));

  // @ts-ignore
  const coinIdsString = useMemo(() => {
    // @ts-ignore
    return coinOptionList.map((coin) => coin.id).join(",");
  }, [coinOptionList]);

  console.log(coinIdsString);

  return (
    <div className={`container ${darkMode ? "dark" : "light"}`}>
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <h1>Coin Tracker</h1>

      <Select
        options={dateRanges}
        value={selectedDateRange}
        onChange={handleDateRangeChange}
        placeholder="Select date range"
      />

      <Select
        options={options}
        onChange={handleCoinSelectChange}
        placeholder="Select crypto"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedCoin && (
        <div>
          <h2>{selectedCoin.label}</h2>
          <button
            onClick={() =>
              setChartMode(chartMode === "real-time" ? "static" : "real-time")
            }
          >
            {chartMode === "real-time"
              ? "Switch to Static Chart"
              : "Switch to Real-Time Chart"}
          </button>
          {loading ? (
            <Spinner />
          ) : chartMode === "real-time" ? (
            <RealTimeLineChart selectedCoin={selectedCoin} />
          ) : (
            <StaticLineChart data={priceHistory} />
          )}
        </div>
      )}
    </div>
  );
}

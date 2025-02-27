"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LineChart } from "@/app/components/d3/LineChart";
import { getCryptoList, getCryptoHistory } from "@/server/api";
import Spinner from "./components/shared/Spinner";
import { ActionMeta } from "react-select";

interface Crypto {
  id: string;
  name: string;
  symbol: string;
}

interface PriceData {
  timestamp: number;
  price: number;
}

interface Option {
  value: string | number;
  label: string;
}

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Home() {
  const [cryptoList, setCryptoList] = useState<Crypto[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Option | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const dateRanges: Option[] = [
    { value: 1, label: "1 Day" },
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
  ];

  const [selectedDateRange, setSelectedDateRange] = useState<Option>(
    dateRanges[2]
  );

  useEffect(() => {
    const fetchCryptoList = async () => {
      setLoading(true);
      try {
        const data: Crypto[] = await getCryptoList();
        setCryptoList(data);
      } catch (err) {
        setError(
          "Failed to load cryptocurrency list from CoinGecko API, try again later"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCryptoList();
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      const fetchCryptoHistory = async () => {
        setLoading(true);
        try {
          const data: PriceData[] = await getCryptoHistory(
            selectedCrypto.value as string,
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
      fetchCryptoHistory();
    }
  }, [selectedCrypto, selectedDateRange]);

  const handleCryptoSelectChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    if (newValue) {
      setSelectedCrypto(newValue as Option);
    } else {
      setSelectedCrypto(null);
    }
  };

  const handleDateRangeChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    if (newValue) {
      setSelectedDateRange(newValue as Option);
    }
  };

  const options: Option[] = cryptoList.map((crypto) => ({
    value: crypto.id,
    label: `${crypto.name} (${crypto.symbol.toUpperCase()})`,
  }));

  return (
    <div className={`container ${darkMode ? "dark" : "light"}`}>
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <h1>Crypto Tracker</h1>

      <Select
        options={dateRanges}
        value={selectedDateRange}
        onChange={handleDateRangeChange}
        placeholder="Select date range"
      />

      <Select
        options={options}
        onChange={handleCryptoSelectChange}
        placeholder="Select a cryptocurrency"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedCrypto && (
        <div>
          <h2>{selectedCrypto.label}</h2>
          {loading ? <Spinner /> : <LineChart data={priceHistory} />}
        </div>
      )}
    </div>
  );
}

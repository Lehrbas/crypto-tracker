//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LineChart } from "@/app/components/d3/LineChart";
import { getCryptoList, getCryptoHistory } from "@/server/api";
import Spinner from "./components/shared/Spinner";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Home() {
  const [cryptoList, setCryptoList] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const dateRanges = [
    { value: 1, label: "1 Day" },
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
  ];

  const [selectedDateRange, setSelectedDateRange] = useState(dateRanges[2]);

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const data = await getCryptoList();
        setCryptoList(data);
      } catch (err) {
        setError("Failed to load cryptocurrency list. Please try again later.");
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
          const data = await getCryptoHistory(
            selectedCrypto.value,
            selectedDateRange.value
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

  const handleSelectChange = (selectedOption) => {
    setSelectedCrypto(selectedOption);
  };

  const handleDateRangeChange = (selectedOption) => {
    setSelectedDateRange(selectedOption);
  };

  const options = cryptoList.map((crypto) => ({
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
        onChange={handleSelectChange}
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

//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LineChart } from "@/app/components/LineChart";
import { getCryptoList, getCryptoHistory } from "@/server/api";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Home() {
  const [cryptoList, setCryptoList] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const data = await getCryptoList();
        setCryptoList(data);
      } catch (err) {
        setError("Failed to load cryptocurrency list. Please try again later.");
      }
    };
    fetchCryptoList();
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      const fetchCryptoHistory = async () => {
        try {
          const data = await getCryptoHistory(selectedCrypto.value);
          setPriceHistory(data);
          setError("");
        } catch (err) {
          setError("Failed to load price history. Please try again later.");
        }
      };
      fetchCryptoHistory();
    }
  }, [selectedCrypto]);

  const handleSelectChange = (selectedOption) => {
    setSelectedCrypto(selectedOption);
  };

  const options = cryptoList.map((crypto) => ({
    value: crypto.id,
    label: `${crypto.name} (${crypto.symbol.toUpperCase()})`,
  }));

  return (
    <div className="container">
      <h1>Crypto Tracker</h1>
      <Select
        options={options}
        onChange={handleSelectChange}
        placeholder="Select a cryptocurrency"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {selectedCrypto && (
        <div>
          <h2>{selectedCrypto.label}</h2>
          <LineChart data={priceHistory} />
        </div>
      )}
    </div>
  );
}

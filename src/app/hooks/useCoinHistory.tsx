// hooks/useCoinHistory.ts
import { useState, useEffect } from "react";
import { PriceData, CoinOption } from "@/app/types/coin";
import { getCoinHistory } from "@/server/api";

export const useCoinHistory = (
  selectedCoin: CoinOption | null,
  selectedDateRange: number
) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCoin) {
      const fetchCoinHistory = async () => {
        setLoading(true);
        try {
          const data: PriceData[] = await getCoinHistory(
            selectedCoin.value as string,
            selectedDateRange
          );
          setPriceHistory(data);
          setError("");
        } catch (err) {
          setError("Failed to load price history.");
        } finally {
          setLoading(false);
        }
      };
      fetchCoinHistory();
    }
  }, [selectedCoin, selectedDateRange]);

  return { priceHistory, error, loading };
};

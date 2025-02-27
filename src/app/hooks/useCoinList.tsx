// hooks/useCoinList.ts
import { useState, useEffect } from "react";
import { Coin } from "@/app/types/coin";
import { getCoinList } from "@/server/api";

export const useCoinList = () => {
  const [coinOptionList, setCoinOptionList] = useState<Coin[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCoinList = async () => {
      setLoading(true);
      try {
        const data: Coin[] = await getCoinList();
        setCoinOptionList(data);
      } catch (err) {
        setError("Failed to load cryptocurrency list.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoinList();
  }, []);

  return { coinOptionList, error, loading };
};

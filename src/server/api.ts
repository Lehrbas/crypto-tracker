const BASE_URL = "https://api.coingecko.com/api/v3";

export const getCryptoList = async () => {
  const response = await fetch(
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch CoinGecko API");
  }

  return response.json();
};

export const getCryptoHistory = async (id: any) => {
  const response = await fetch(
    `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=30`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch crypto history");
  }
  const data = await response.json();
  return data.prices;
};

export interface Coin {
  id: string;
  name: string;
  symbol: string;
}

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface CoinOption {
  value: string | number;
  label: string;
}

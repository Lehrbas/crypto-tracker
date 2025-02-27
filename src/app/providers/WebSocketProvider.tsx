"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";

import { stringifiedCoinList } from "@/static/stringifiedCoinList";

export interface WebSocketCoinData {
  time: number;
  coin: string;
  price: number;
}

interface WebSocketContextType {
  data: WebSocketCoinData[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WebSocketCoinData[]>([]);
  const wsRef = useRef<WebSocket | null>(null); // Ref to store the WebSocket instance

  useEffect(() => {
    // Close the existing WebSocket connection if it exists
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create a new WebSocket connection
    wsRef.current = new WebSocket(
      `wss://ws.coincap.io/prices?assets=${stringifiedCoinList}`
    );

    wsRef.current.onmessage = (event) => {
      const jsonData = JSON.parse(event.data);
      const updatedData = Object.entries(jsonData).map(([coin, price]) => ({
        time: Date.now(),
        coin,
        price: parseFloat(price as string),
      }));
      // Slice data to keep only the last 100 data points
      setData((prevData) => [...prevData, ...updatedData].slice(-100));
    };

    wsRef.current.onclose = () => console.log("WebSocket connection closed");
    wsRef.current.onerror = (error) => console.error("WebSocket error:", error);

    // Cleanup: Close the WebSocket connection when the component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ data }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
};

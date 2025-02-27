"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  useWebSocket,
  WebSocketCoinData,
} from "@/app/providers/WebSocketProvider";
import styles from "./RealTimeLineChart.module.css";
import { CoinOption } from "@/app/types/coin";

interface RealTimeLineChartProps {
  selectedCoin: CoinOption;
}

export const RealTimeLineChart = (props: RealTimeLineChartProps) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const { data } = useWebSocket();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const filteredData = data.filter(
      (d: WebSocketCoinData) => d.coin === props.selectedCoin.value
    );

    if (filteredData.length === 0) return; // No data for the selected coin

    const x = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => d.time) as [number, number])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => d.price) || 0,
        d3.max(filteredData, (d) => d.price) || 100,
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<{ time: number; price: number }>()
      .x((d) => x(d.time))
      .y((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    console.log("realtime linechart data:", filteredData);

    svg
      .append("path")
      .datum(filteredData.filter((d) => d.coin === props.selectedCoin.value)) // Filter data for the selected coin
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat(d3.timeFormat("%H:%M:%S") as any)
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data, props.selectedCoin]);

  return (
    <svg ref={chartRef} width={800} height={400} className={styles.chart}></svg>
  );
};

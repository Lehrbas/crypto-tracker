// @ts-nocheck
"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

export const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    if (data.length > 0) {
      const svg = d3.select(chartRef.current);
      svg.selectAll("*").remove(); // Clear previous chart

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => new Date(d[0])))
        .range([margin.left, width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d[1])])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const line = d3
        .line()
        .x((d) => x(new Date(d[0])))
        .y((d) => y(d[1]));

      svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5));

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    }
  }, [data]);

  return <svg ref={chartRef}></svg>;
};

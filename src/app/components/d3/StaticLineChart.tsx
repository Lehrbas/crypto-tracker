// @ts-nocheck

"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import styles from "./StaticLineChart.module.css";
import { PriceData } from "@/app/types/coin";

interface StaticLineChartProps {
  data: PriceData[];
}

export const StaticLineChart: React.FC<StaticLineChartProps> = ({ data }) => {
  const chartRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!data) return;

    if (data) {
      const svg = d3.select(chartRef.current);
      // Clear previous chart
      svg.selectAll("*").remove();

      // Define chart proportions
      const margin = { top: 20, right: 30, bottom: 40, left: 70 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Create the X axis
      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => new Date(d[0])))
        .range([margin.left, width - margin.right]);

      // Create the Y axis
      const y = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => d[1]), d3.max(data, (d) => d[1])])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Create the value line
      const line = d3
        .line()
        .x((d) => x(new Date(d[0])))
        .y((d) => y(d[1]));

      // Add gradient for the line, this can be further customized
      svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height)
        .selectAll("stop")
        .data([
          { offset: "0%", color: "#36d7b7" },
          { offset: "100%", color: "#2ecc71" },
        ])
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

      // Add the line path
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)")
        .attr("stroke-width", 3)
        .attr("d", line);

      // Add X axis
      const xAxis = d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat(d3.timeFormat("%b %d"))
        .tickSizeOuter(0);

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .select(".domain")
        .attr("stroke", "#ccc");

      // Add Y axis
      const yAxis = d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `$${d.toFixed(2)}`)
        .tickSizeOuter(0);

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .select(".domain")
        .attr("stroke", "#ccc");

      // Add grid lines
      svg
        .append("g")
        .attr("class", styles.grid)
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(5)
            .tickSize(-height + margin.top + margin.bottom)
            .tickFormat("")
        );

      svg
        .append("g")
        .attr("class", styles.grid)
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-width + margin.left + margin.right)
            .tickFormat("")
        );

      // Add hover effects
      const focus = svg
        .append("g")
        .attr("class", styles.focus)
        .style("display", "none");

      focus
        .append("circle")
        .attr("r", 5)
        .attr("fill", "#36d7b7")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      svg
        .append("rect")
        .attr("class", styles.overlay)
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => {
          focus.style("display", "none");
          setTooltip(null);
        })
        .on("mousemove", (event) => {
          const [xPos] = d3.pointer(event);
          const bisectDate = d3.bisector((d) => new Date(d[0])).left;
          const x0 = x.invert(xPos);
          const i = bisectDate(data, x0, 1);

          // Handle cases where there is no data point
          if (i <= 0 || i >= data.length) {
            focus.style("display", "none");
            setTooltip(null);
            return;
          }

          const d0 = data[i - 1];
          const d1 = data[i];
          const d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;

          focus.attr("transform", `translate(${x(new Date(d[0]))},${y(d[1])})`);
          setTooltip({
            text: `Date: ${new Date(
              d[0]
            ).toLocaleDateString()}, Price: $${d[1].toFixed(2)}`,
          });
        });
    }
  }, [data]);

  return (
    <div className={styles.chartContainer}>
      <svg ref={chartRef} width={800} height={400}></svg>
      {tooltip && <div className={styles.tooltip}>{tooltip.text}</div>}
    </div>
  );
};

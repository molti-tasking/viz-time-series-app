import * as d3 from "d3";
import { useEffect, useRef } from "react";

export const TreeMap = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Sample data (feel free to replace with your own)
    const data = {
      name: "flare",
      children: [
        {
          name: "analytics",
          children: [
            { name: "cluster", size: 3938 },
            { name: "graph", size: 3534 },
          ],
        },
        {
          name: "animate",
          children: [
            { name: "Easing", size: 17010 },
            { name: "FunctionSequence", size: 5842 },
          ],
        },
      ],
    };

    const width = 600;
    const height = 400;

    // 1. Construct a root node with d3.hierarchy
    // 2. Sum values for each node.
    // 3. Optionally sort nodes based on descending value.
    const root = d3
      .hierarchy(data)
      .sum((d) => d.size)
      .sort((a, b) => b.value - a.value);

    // Initialize treemap layout
    d3
      .treemap()
      .size([width, height]) // set the size of the treemap
      .padding(1)(
      // add some padding around cells
      root
    );

    // Select the <svg> element and set up attributes
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create a color scale for rectangles
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Bind data for each leaf node
    const leaves = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Append rectangles
    leaves
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => color(d.parent.data.name));

    // Append text labels
    leaves
      .append("text")
      .attr("x", 4)
      .attr("y", 16)
      .attr("fill", "white") // you might change text color or style
      .style("font-size", "12px")
      .text((d) => d.data.name);
  }, []);

  return <svg ref={svgRef} />;
};

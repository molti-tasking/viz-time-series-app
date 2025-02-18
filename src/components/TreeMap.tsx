import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface TreeMapProps {
  height?: number;
  width?: number;

  leaves: {
    name: string;
    /**
     * The significance of the leaf to be indicating the size of the children component.
     */
    significance: number;
    children: React.ReactNode;
  }[];
}

export const TreeMap = ({
  height = 400,
  width = 600,
  ...props
}: TreeMapProps) => {
  const svgRef = useRef(null);

  const buildTreemap = () => {
    // Sample data (feel free to replace with your own)
    const data = {
      children: [
        ...props.leaves.map((leaf) => ({
          name: leaf.name,
          size: leaf.significance,
        })),
      ],
    };

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
      .padding(4)(
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
      .attr("fill", (d) => color(d.data.name));

    // Append text labels
    leaves
      .append("text")
      .attr("x", 4)
      .attr("y", 16)
      .attr("fill", "white") // you might change text color or style
      .style("font-size", "12px")
      .text((d) => d.data.name);
  };

  useEffect(() => {
    buildTreemap();
  }, [height, width, props.leaves]);

  return <svg ref={svgRef} />;
};

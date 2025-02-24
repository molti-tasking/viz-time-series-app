import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

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
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<
    {
      x: number;
      y: number;
      width: number;
      height: number;
      children: React.ReactNode;
    }[]
  >([]);

  const buildTreemap = () => {
    // Sample data (feel free to replace with your own)
    const data = {
      children: [
        ...props.leaves.map((leaf) => ({
          name: leaf.name,
          size: leaf.significance,
          children: leaf.children,
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
    d3.treemap().size([width, height]).padding(4)(root);

    const newNodes = root.leaves().map((d) => ({
      x: d.x0,
      y: d.y0,
      width: d.x1 - d.x0,
      height: d.y1 - d.y0,
      children: d.data.children,
    }));

    setNodes(newNodes);

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

    leaves
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => "#eee")
      .attr("fill-opacity", 0.1);
  };

  useEffect(() => {
    buildTreemap();
  }, [height, width, props.leaves]);

  return (
    <div style={{ position: "relative", width, height }}>
      <svg ref={svgRef} style={{ position: "absolute", top: 0, left: 0 }} />
      {nodes.map((node, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            width: node.width,
            height: node.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {node.children}
        </div>
      ))}
    </div>
  );
};

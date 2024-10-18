import { VegaLite, type VisualizationSpec } from "react-vega";
import rawData from "../data_entries.csv?raw";
import { csvParse } from "d3";

const data = csvParse(rawData);

const dimensions = data.columns.filter((col) => col !== "timestamp");
const values = data.map((row) => row);

const spec: VisualizationSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: "container",
  data: {
    values,
  },
  transform: [
    {
      fold: dimensions,
      as: ["variable", "value"],
    },
    {
      calculate: "toNumber(datum.value)",
      as: "value",
    },
    {
      calculate: "toNumber(datum.timestamp)",
      as: "timestamp",
    },
  ],
  mark: "line",
  encoding: {
    x: {
      field: "timestamp",
      type: "temporal",
      title: "Time",
    },
    y: {
      field: "value",
      type: "quantitative",
      title: "Value",
    },
    color: {
      field: "variable",
      type: "nominal",
      title: "Variables",
    },
  },
};

export const MultiLineChart = () => {
  // className="container w-screen"
  return <VegaLite spec={spec} className="container w-full mt-2" />;
};

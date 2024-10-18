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
    {
      aggregate: [
        {
          op: "mean",
          field: "value",
          as: "mean_value",
        },
        {
          op: "max",
          field: "value",
          as: "max_value",
        },
        {
          op: "min",
          field: "value",
          as: "min_value",
        },
        {
          op: "q1",
          field: "value",
          as: "q1_value",
        },
        {
          op: "q3",
          field: "value",
          as: "q3_value",
        },
      ],
      groupby: ["timestamp"],
    },
    {
      fold: ["mean_value", "max_value", "min_value", "q1_value", "q3_value"],
      as: ["aggregation", "value"],
    },
  ],
  layer: [
    {
      mark: {
        type: "area",
        color: "steelblue",
        opacity: 0.3,
      },
      encoding: {
        x: {
          field: "timestamp",
          type: "temporal",
          title: "Time",
        },
        y: {
          field: "q1_value",
          type: "quantitative",
          title: "Value",
        },
        y2: {
          field: "q3_value",
        },
      },
    },
    {
      // Mean line (solid)
      mark: {
        type: "line",
        tooltip: true,
      },
      encoding: {
        x: {
          field: "timestamp",
          type: "temporal",
          title: "Time",
        },
        y: {
          field: "value",
          type: "quantitative",
        },
        color: {
          field: "aggregation",
          type: "nominal",
          scale: {
            domain: ["mean_value", "max_value", "min_value"],
            range: ["steelblue", "steelblue", "steelblue"],
          },
        },
        strokeDash: {
          field: "aggregation",
          type: "nominal",
          scale: {
            domain: ["max_value", "min_value"],
            range: [
              [4, 4],
              [4, 4],
            ],
          },
        },
      },
    },
  ],
};

export const AggregatedLineChart = () => {
  return <VegaLite spec={spec} className="container w-full mt-2" />;
};

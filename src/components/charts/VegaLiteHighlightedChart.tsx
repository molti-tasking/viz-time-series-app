import { cn } from "@/lib/utils";
import { VegaLite, type VisualizationSpec } from "react-vega";
import { ChartProps } from "./ChartProps";

export const VegaLiteHighlightedChart = ({
  values,
  className,
  yDomain,
  saveScreenSpace,
  highlightInfo,
}: ChartProps & {
  highlightInfo?: { dimension: string; opacity: number }[];
}) => {
  const dimensions: string[] = values.length
    ? Object.keys(values[0]).filter((e) => e !== "timestamp")
    : [];

  const spec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: "container",
    background: "transparent",

    data: { values },
    transform: [{ fold: dimensions, as: ["variable", "value"] }],
    mark: "line",
    encoding: {
      x: {
        field: "timestamp",
        type: !!saveScreenSpace ? "ordinal" : "temporal",
        axis: !!saveScreenSpace ? { labelExpr: "" } : undefined,
        title: "Time",
      },
      y: {
        field: "value",
        type: "quantitative",
        title: "Value",
        scale: { domain: yDomain },
      },
    },

    layer: [
      {
        transform: [
          ...(!!highlightInfo?.length
            ? [
                {
                  fold: highlightInfo?.map(({ dimension }) => dimension),
                  as: ["variable", "column"] as [string, string],
                },
              ]
            : []),
          { calculate: "toNumber(datum.value)", as: "value" },
          { calculate: "toNumber(datum.timestamp)", as: "timestamp" },
        ],
        mark: { type: "line" },
        encoding: {
          x: { field: "timestamp", type: "temporal", title: "Time" },
          y: { field: "column", type: "quantitative", title: "Value" },
          color: { field: "variable", type: "ordinal" },
          opacity: {
            condition: highlightInfo?.map(({ dimension, opacity }) => ({
              test: `datum.variable === '${dimension}'`,
              value: dimensions.length < 3 ? 1.0 : opacity,
            })),
            value: 0.3,
          },
        },
      },
      {
        mark: { type: "area", color: "steelblue", opacity: 0.3 },
        encoding: {
          x: { field: "timestamp", type: "temporal", title: "Time" },
          y: { field: "min_value", type: "quantitative", title: "Value" },
          y2: { field: "max_value" },
        },
        transform: [
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
              { op: "mean", field: "value", as: "mean_value" },
              { op: "max", field: "value", as: "max_value" },
              { op: "min", field: "value", as: "min_value" },
              { op: "q1", field: "value", as: "q1_value" },
              { op: "q3", field: "value", as: "q3_value" },
            ],
            groupby: ["timestamp"],
          },
          {
            fold: [
              "mean_value",
              "max_value",
              "min_value",
              "q1_value",
              "q3_value",
            ],
            as: ["aggregation", "value"],
          },
        ],
      },
    ],
  };

  return (
    <VegaLite
      spec={spec}
      style={{ cursor: "pointer" }}
      className={cn("flex-1", className, "rounded-sm overflow-hidden min-h-40")}
    />
  );
};

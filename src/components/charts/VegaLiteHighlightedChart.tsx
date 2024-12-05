import { cn } from "@/lib/utils";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { VegaLite, type VisualizationSpec } from "react-vega";
import { ChartProps } from "./ChartProps";

export const VegaLiteHighlightedChart = ({
  values,
  className,
  yDomain,
  saveScreenSpace,
}: ChartProps) => {
  const clusterAssignment = useViewModelStore(
    (state) => state.clusterAssignment
  );
  const clusterAssignmentHistoryDepth = useViewSettingsStore(
    (state) => state.clusterAssignmentHistoryDepth
  );
  const clusterAssignmentHistory = useViewModelStore(
    (state) => state.clusterAssignmentHistory
  ).slice(0, clusterAssignmentHistoryDepth);

  const dimensions = values.length
    ? Object.keys(values[0]).filter((e) => e !== "timestamp")
    : [];

  // Now we want to find out, which columns of the current cluster changed in the past.
  // We want to find out a certain opacity indicating the "difference" of that value.
  // We can do it by checking each time series and compare it like this:
  // 1. Get current cluster.
  // 2. Check for how many of the past clusters it had a different cluster.
  // 3. The more different clusters it has, the higher the opacity.

  const timeSeriesToBeHighlighted: { dimension: string; opacity: number }[] =
    [];

  for (let dimIndex = 0; dimIndex < dimensions.length; dimIndex++) {
    const dimension = dimensions[dimIndex];
    const currentCluster = clusterAssignment.find(
      ([currDim]) => dimension === currDim
    )?.[1];

    let differentClustersInPast = 0;

    for (
      let clusterIndex = 0;
      clusterIndex < clusterAssignmentHistory.length;
      clusterIndex++
    ) {
      const pastClusterAssignment = clusterAssignmentHistory[clusterIndex];
      const pastCluster = pastClusterAssignment.entries.find(
        ([currDim]) => dimension === currDim
      )?.[1];

      const isSameCluster = currentCluster === pastCluster;
      if (!isSameCluster) {
        differentClustersInPast = differentClustersInPast + 1;
      }
    }

    if (differentClustersInPast > 0) {
      const opacity = differentClustersInPast / clusterAssignmentHistory.length;
      timeSeriesToBeHighlighted.push({ dimension, opacity });
    }
  }

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
          ...(!!timeSeriesToBeHighlighted.length
            ? [
                {
                  fold: timeSeriesToBeHighlighted.map(
                    ({ dimension }) => dimension
                  ),
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
            condition: timeSeriesToBeHighlighted.map(
              ({ dimension, opacity }) => ({
                test: `datum.variable === '${dimension}'`,
                value: opacity,
              })
            ),
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

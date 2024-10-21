import { VegaLite, type VisualizationSpec } from "react-vega";
import { useDataContext } from "./RawDataContext";
import { clustering } from "@/lib/clustering";

export const MultiAggregatedLineChart = () => {
  const { dimensions, values } = useDataContext();
  console.log(JSON.stringify(values));

  const aggregated = clustering(values, 2);
  console.log(aggregated);

  return (
    <div className="container w-full my-2 flex flex-row flex-wrap gap-2">
      {aggregated.map((val, index) => (
        <AggregatedLineChart dimensions={dimensions} values={val} key={index} />
      ))}
    </div>
  );
};
const AggregatedLineChart = ({
  values,
  dimensions,
}: {
  dimensions: string[];
  values: Record<string, number>[];
}) => {
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

  return <VegaLite spec={spec} className="flex-1" />;
};

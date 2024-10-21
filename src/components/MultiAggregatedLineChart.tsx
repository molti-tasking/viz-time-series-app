import { VegaLite, type VisualizationSpec } from "react-vega";
import { useDataContext } from "./RawDataContext";
import { clustering } from "@/lib/clustering";
import { Input } from "./ui/input";
import { useState } from "react";

export const MultiAggregatedLineChart = () => {
  const { values } = useDataContext();

  const [clusterCount, setClusterCount] = useState(2);
  const aggregated = clustering(values, clusterCount);

  return (
    <div className="container w-full my-2 flex flex-col flex-wrap gap-2">
      <div className="flex flex-row gap-4 items-center">
        <span>Amount of clusters (sorted by last value)</span>
        <div>
          <Input
            value={clusterCount}
            onChange={(event) => setClusterCount(event.target.valueAsNumber)}
            type="number"
          />
        </div>
      </div>
      {/* <div className="w-full my-2 flex flex-row flex-wrap gap-2"> */}
      {aggregated.map((val, index) => (
        <AggregatedLineChart values={val} key={index} />
      ))}
      {/* </div> */}
    </div>
  );
};
const AggregatedLineChart = ({
  values,
}: {
  values: Record<string, number>[];
}) => {
  const dimensions = values.length
    ? Object.keys(values[0]).filter((e) => e !== "timestamp")
    : [];
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
      // {
      //   calculate: "toNumber(datum.value)",
      //   as: "value",
      // },
      // {
      //   calculate: "toNumber(datum.timestamp)",
      //   as: "timestamp",
      // },
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

  return <VegaLite spec={spec} className="flex-1" />;
};

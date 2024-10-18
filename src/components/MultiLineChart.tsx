import { VegaLite, type VisualizationSpec } from "react-vega";
import { useDataContext } from "./RawDataContext";

export const MultiLineChart = () => {
  const { dimensions, values } = useDataContext();

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

  return <VegaLite spec={spec} className="container w-full mt-2" />;
};

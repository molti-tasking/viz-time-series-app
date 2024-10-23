import { VegaLite, type VisualizationSpec } from "react-vega";
import { useDataContext } from "./RawDataContext";
import { clustering } from "@/lib/clustering";
import { Input } from "./ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const MultiAggregatedLineChart = () => {
  const { values, dimensions } = useDataContext();
  const colors: ClassValue[] = [
    "bg-red-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-purple-200",
    "bg-emerald-200",
    "bg-orange-200",
    "bg-teal-200",
    "bg-rose-200",
    "bg-lime-200",
    "bg-cyan-200",
    "bg-pink-200",
    "bg-amber-200",
    "bg-sky-200",
  ];
  const [clusterCount, setClusterCount] = useState(2);
  const aggregated = clustering(values, clusterCount);

  // Dirty code begins
  const colsAccordingToAggregation: [string, number][] = dimensions.map(
    (val) => [
      val,
      aggregated.findIndex((entries) => Object.keys(entries[0]).includes(val)),
    ]
  );

  // Calculate the shared y-axis domain across all clusters
  const allValues = values.flatMap((entries) =>
    Object.entries(entries).flatMap(([key, value]) =>
      key === "timestamp" ? [] : [value]
    )
  );
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yDomain: [number, number] = [yMin, yMax];

  // Dirty code ends (Hopefully)

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
        <AggregatedLineChart
          values={val}
          key={index}
          className={colors[index]}
          yDomain={yDomain}
        />
      ))}
      {/* </div> */}
      <div className="flex flex-row flex-shrink items-center rounded-sm overflow-hidden">
        {colsAccordingToAggregation.map(([name, styleGroup], index) => (
          <TooltipProvider key={`${name}-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    colors[styleGroup],
                    "flex-1 h-4",
                    index > 0 ? "border-l-[0.5px]" : ""
                  )}
                ></div>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};
const AggregatedLineChart = ({
  values,
  className,
  yDomain,
}: {
  values: Record<string, number>[];
  className: ClassValue;
  yDomain: [number, number];
}) => {
  const dimensions = values.length
    ? Object.keys(values[0]).filter((e) => e !== "timestamp")
    : [];
  const spec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: "container",
    background: "transparent",
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
        scale: {
          domain: yDomain,
        },
      },
      color: {
        field: "variable",
        type: "nominal",
        title: "Variables",
      },
    },
  };

  return (
    <VegaLite
      spec={spec}
      className={cn("flex-1", className, " rounded-sm overflow-hidden")}
    />
  );
};

import { type ChartPresentationSettings } from "@/lib/clustering";
import { cn, deepMerge } from "@/lib/utils";
import { ChartWrappingSettings, wrapper } from "@/lib/wrapping";
import { type ClassValue } from "clsx";
import { useState } from "react";
import { VegaLite, type VisualizationSpec } from "react-vega";
import { useDataContext } from "./RawDataContext";

const chartModeSpecs: Record<
  ChartPresentationSettings["mode"],
  Partial<VisualizationSpec>
> = {
  multiline: {
    encoding: {
      color: {
        field: "variable",
        type: "nominal",
        title: "Variables",
      },
    },
  },
  envelope: {
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
  },
  horizon: {},
};

// TODO: Make this chart mostly recursive in a way that a user sees a subset whenever he selects one of those charts

export const HorizontalWrappedLineChart = () => {
  const { values, dimensions } = useDataContext();

  const [presentationSettings, setPresentationSettings] =
    useState<ChartWrappingSettings>({
      meanRange: 0.1,
      tickRange: 8,
      mode: "multiline",
    });

  const { filteredData } = wrapper(values, dimensions, presentationSettings);

  return (
    <div className="container w-full my-2 flex flex-col flex-wrap gap-2">
      <div className="flex flex-row-reverse gap-4 items-center">
        {/* <ChartPresentationSettingsPopover
          settings={presentationSettings}
          setSettings={setPresentationSettings}
        /> */}
        <div>Make stuff configurable</div>
      </div>
      <AggregatedLineChart
        values={filteredData}
        mode={presentationSettings.mode}
      />
    </div>
  );
};
const AggregatedLineChart = ({
  values,
  className,
  yDomain,
  mode,
}: {
  values: Record<string, number>[];
  className?: ClassValue;
  yDomain?: [number, number];
  mode: ChartPresentationSettings["mode"];
}) => {
  const dimensions = values.length
    ? Object.keys(values[0]).filter((e) => e !== "timestamp")
    : [];
  const dataSpec: Partial<VisualizationSpec> = {
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
        type: "temporal",
        title: "Time",
      },
      y: {
        field: "value",
        type: "quantitative",
        title: "Value",
        scale: { domain: yDomain },
      },
    },
  };

  // I don't 100% know why, but as of now it was very important to keep this order of the specs how they are getting passed into the merge function. Otherwise, the vizualisation breaks.
  const spec = deepMerge(dataSpec, chartModeSpecs[mode]);

  return (
    <VegaLite
      spec={spec}
      style={{ cursor: "pointer" }}
      className={cn("flex-1", className)}
    />
  );
};
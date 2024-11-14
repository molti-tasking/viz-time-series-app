import { type ChartPresentationSettings, aggregatorB } from "@/lib/clusteringB";
import { cn, deepMerge } from "@/lib/utils";
import { useRawDataStore } from "@/store/useRawDataStore";
import { type ClassValue } from "clsx";
import { VegaLite, type VisualizationSpec } from "react-vega";
import { ClusterChartPreferencesPopover } from "./ClusterChartPreferencesPopover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";

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
};

// TODO: Make this chart mostly recursive in a way that a user sees a subset whenever he selects one of those charts

export const MultiAggregatedLineChart = () => {
  const dimensions = useRawDataStore((state) => state.dimensions);
  const values = useRawDataStore((state) => state.values);

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
  const presentationSettings = useViewSettingsStore();
  console.time("Aggregator duration");

  const { aggregated, colsAccordingToAggregation, yDomain } = aggregatorB(
    values,
    dimensions,
    presentationSettings
  );
  console.timeEnd("Aggregator duration");

  const boringDataCount = values.length - aggregated[0].length;

  return (
    <div className="container w-full my-2 flex flex-col flex-wrap gap-2">
      <div className="flex flex-row justify-between gap-4 items-center">
        <div>
          Ignored {boringDataCount} entries. Showing {aggregated.length}{" "}
          clusters.
        </div>
        <ClusterChartPreferencesPopover />
        {/* <pre>{JSON.stringify(presentationSettings)}</pre> */}
      </div>

      <div className="flex flex-row flex-shrink items-center rounded-sm overflow-hidden">
        {colsAccordingToAggregation.map(([name, styleGroup], index) => (
          <TooltipProvider key={`${name}-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    colors[styleGroup % colors.length],
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
      <div className="flex-1 flex flex-col gap-2 overflow-scroll">
        {aggregated.map((val, index) => (
          <AggregatedLineChart
            values={val}
            key={index}
            className={colors[index % colors.length]}
            yDomain={yDomain}
            presentationSettings={presentationSettings}
          />
        ))}
      </div>
    </div>
  );
};
const AggregatedLineChart = ({
  values,
  className,
  yDomain,
  presentationSettings,
}: {
  values: Record<string, number>[];
  className: ClassValue;
  yDomain: [number, number];
  presentationSettings: ChartPresentationSettings;
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
        type:
          "saveScreenSpace" in presentationSettings &&
          !!presentationSettings.saveScreenSpace
            ? "ordinal"
            : "temporal",
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
  const spec = deepMerge(dataSpec, chartModeSpecs[presentationSettings.mode]);

  return (
    <VegaLite
      spec={spec}
      style={{ cursor: "pointer" }}
      className={cn("flex-1", className, "rounded-sm overflow-hidden min-h-40")}
    />
  );
};

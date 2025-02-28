import { VegaLiteHighlightedChart } from "@/components/charts/VegaLiteHighlightedChart";
import { ClusterChartPreferencesPopover } from "@/components/ClusterChartPreferencesPopover";
import { clusterColors } from "@/components/clusterColors";
import { TreeMap } from "@/components/TreeMap";
import { useContainerDimensions } from "@/components/useContainerDimensions";
import { useRawDataStore } from "@/store/useRawDataStore";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { useEffect, useRef } from "react";

export default function MutliAggregatedTreeMap() {
  const mode = useViewSettingsStore((state) => state.mode);
  const aggregated = useViewModelStore((data) => data.aggregated);
  const highlightInfo = useViewModelStore((state) => state.highlightInfo);
  const yDomain = useViewModelStore((state) => state.yDomain);

  const ref = useRef<HTMLDivElement>(null);
  const { height, width } = useContainerDimensions(ref);

  const processData = useViewModelStore((state) => state.processData);
  const values = useRawDataStore((state) => state.values);
  // const dimensions = useRawDataStore((state) => state.dimensions);

  const presentationSettings = useViewSettingsStore();

  useEffect(() => {
    processData();
  }, [presentationSettings, values]);

  console.log("Render aggregated treemap");
  return (
    <div className="container w-full py-2 flex flex-col flex-wrap gap-2 h-full">
      <div className="flex flex-row justify-between gap-4 items-center">
        <div className="text-muted-foreground">
          Detected {aggregated.length} clusters.
        </div>
        <ClusterChartPreferencesPopover />
        {/* <pre>{JSON.stringify(presentationSettings)}</pre> className="w-full h-80" */}
      </div>
      <div ref={ref} className="flex-1">
        <TreeMap
          key={aggregated.length}
          width={width}
          height={height}
          leaves={aggregated.map((clusters, index) => {
            const columns = Object.keys(clusters[0]).filter(
              (_, index) => index !== 0
            );
            const name = columns.join(", ");
            const significance = columns.length;

            return {
              name,
              significance,
              ClusterComponent: ({ currentWidth, totalMaxWidth }) => {
                // In this function we calculate the last few entries for each cluster based on the available space:
                // We want to display the same amount of time per pixel accross all the different time series.
                // So depending on available screen width we want only keep the latest entries that fit into the available space.

                // The implementation below is kind of unprecise because it relies on the underlying charts themselves display the information in the full width.

                const relativeWidth = currentWidth / totalMaxWidth;
                const keptValueCount = Math.ceil(
                  clusters.length * relativeWidth
                );
                const values = clusters.slice(-keptValueCount);

                return (
                  <VegaLiteHighlightedChart
                    values={values}
                    key={index}
                    className={"w-full h-full"}
                    yDomain={yDomain}
                    mode={mode}
                    highlightInfo={highlightInfo?.[index]}
                    chartColor={clusterColors[index % clusterColors.length]}
                  />
                );
              },
            };
          })}
        />
      </div>
    </div>
  );
}

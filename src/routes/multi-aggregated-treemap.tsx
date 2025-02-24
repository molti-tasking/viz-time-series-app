import { VegaLiteHighlightedChart } from "@/components/charts/VegaLiteHighlightedChart";
import { ClusterChartPreferencesPopover } from "@/components/ClusterChartPreferencesPopover";
import { clusterColors } from "@/components/clusterColors";
import { TreeMap } from "@/components/TreeMap";
import { useContainerDimensions } from "@/components/useContainerDimensions";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { useRef } from "react";

export default function MutliAggregatedTreeMap() {
  const mode = useViewSettingsStore((state) => state.mode);
  const aggregated = useViewModelStore((data) => data.aggregated);
  const highlightInfo = useViewModelStore((state) => state.highlightInfo);
  const yDomain = useViewModelStore((state) => state.yDomain);

  const ref = useRef<HTMLDivElement>(null);
  const { height, width } = useContainerDimensions(ref);
  console.log(height, width);

  return (
    <div className="container w-full py-2 flex flex-col flex-wrap gap-2 h-full">
      <div className="flex flex-row justify-between gap-4 items-center">
        <div className="text-muted-foreground">
          Detected {aggregated.length} clusters.
        </div>
        <ClusterChartPreferencesPopover />
        {/* <pre>{JSON.stringify(presentationSettings)}</pre> className="w-full h-80" */}
      </div>
      <div ref={ref}>
        <TreeMap
          width={width}
          leaves={aggregated.map((clusters, index) => {
            const columns = Object.keys(clusters[0]).filter(
              (_, index) => index !== 0
            );
            const name = columns.join(", ");
            const significance = columns.length;

            return {
              name,
              significance,
              children: (
                <VegaLiteHighlightedChart
                  values={clusters}
                  key={index}
                  className={"w-full h-full"}
                  yDomain={yDomain}
                  mode={mode}
                  highlightInfo={highlightInfo?.[index]}
                  chartColor={clusterColors[index % clusterColors.length]}
                />
              ),
            };
          })}
        />
      </div>
    </div>
  );
}

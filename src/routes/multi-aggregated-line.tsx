import { AggregatedClusterView } from "@/components/AggregatedClusterView";
import { MultiAggregatedLineChart } from "@/components/MultiAggregatedLineChart";
import { VisualizationPreferencesPopover } from "@/components/forms/VisualizationPreferencesPopover";
import { useStreamClustersSettingsStore } from "@/store/useStreamClustersSettingsStore";
import { useViewModelStore } from "@/store/useViewModelStore";

export default function MutliAggregatedLine() {
  const mode = useStreamClustersSettingsStore((state) => state.layoutMode);
  const aggregated = useViewModelStore((data) => data.aggregated);

  return (
    <div className="container w-full py-2 flex flex-col flex-wrap gap-2 h-full">
      <div className="flex flex-row justify-between gap-4 items-center">
        <div className="text-muted-foreground">
          Detected {aggregated.length} clusters.
        </div>
        <VisualizationPreferencesPopover />
        {/* <pre>{JSON.stringify(presentationSettings)}</pre> */}
      </div>
      {mode === "clusterMap" ? (
        <AggregatedClusterView />
      ) : (
        <MultiAggregatedLineChart />
      )}
    </div>
  );
}

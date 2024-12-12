import { AggregatedClusterView } from "@/components/AggregatedClusterView";
import { ClusterChartPreferencesPopover } from "@/components/ClusterChartPreferencesPopover";
import { MultiAggregatedLineChart } from "@/components/MultiAggregatedLineChart";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";

export default function MutliAggregatedLine() {
  const mode = useViewSettingsStore((state) => state.mode);
  const aggregated = useViewModelStore((data) => data.aggregated);

  return (
    <div className="container w-full py-2 flex flex-col flex-wrap gap-2 h-full">
      <div className="flex flex-row justify-between gap-4 items-center">
        <div className="text-muted-foreground">
          Detected {aggregated.length} clusters.
        </div>
        <ClusterChartPreferencesPopover />
        {/* <pre>{JSON.stringify(presentationSettings)}</pre> */}
      </div>
      {mode === "clusters" ? (
        <AggregatedClusterView />
      ) : (
        <MultiAggregatedLineChart />
      )}
    </div>
  );
}

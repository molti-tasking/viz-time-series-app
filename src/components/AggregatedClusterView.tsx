import { ClusterView } from "@/lib/clusteringOverTime";
import { cn } from "@/lib/utils";
import { useViewModelStore } from "@/store/useViewModelStore";
import { clusterColors } from "./clusterColors";

export const AggregatedClusterView = () => {
  // const values = useRawDataStore((state) => state.values);
  // // const dimensions = useRawDataStore((state) => state.dimensions);

  // const presentationSettings = useViewSettingsStore();

  // const { colsAccordingToAggregation, processData } = useViewModelStore();

  // useEffect(() => {
  //   processData();
  // }, [presentationSettings, values]);

  const { colsAccordingToAggregation } = useViewModelStore();

  const clustersInTime: ClusterView[] = [
    { timestamp: "asdf", clusters: colsAccordingToAggregation },
    { timestamp: "asdf", clusters: colsAccordingToAggregation },
    { timestamp: "asdf", clusters: colsAccordingToAggregation },
  ];
  return (
    <div className="flex flex-1 flex-row w-full my-2">
      {clustersInTime.map(({ timestamp, clusters }, groupIndex) => (
        <div
          className={cn(
            "flex flex-1 flex-col flex-shrink items-center overflow-hidden",
            groupIndex > 0 ? "border-l-[0.5px] border-white" : "rounded-l-sm"
          )}
        >
          {clusters.map(([name, styleGroup], clusterIndex) => (
            <div
              key={`${groupIndex}-${clusterIndex}-${name}`}
              className={cn(
                clusterColors[styleGroup % clusterColors.length],
                "flex-1 min-w-4 w-full",
                clusterIndex > 0 ? "border-t-[0.5px] border-white" : ""
              )}
            ></div>
          ))}
          <div>{timestamp}</div>
        </div>
      ))}
    </div>
  );
};

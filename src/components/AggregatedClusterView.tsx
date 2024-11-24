import { cn } from "@/lib/utils";
import { useViewModelStore } from "@/store/useViewModelStore";
import { clusterColors } from "./clusterColors";

export const AggregatedClusterView = () => {
  const { colsAccordingToAggregation } = useViewModelStore();

  const clustersInTime: [string, number][][] = [
    colsAccordingToAggregation,
    colsAccordingToAggregation,
    colsAccordingToAggregation,
  ];
  console.log(clustersInTime);
  return (
    <div className="flex w-full p-8">
      {clustersInTime.map((clusters, groupIndex) => (
        <div
          className={cn(
            "flex flex-1 flex-col flex-shrink items-center rounded-sm overflow-hidden",
            groupIndex > 0 ? "border-l-[0.5px] border-white" : ""
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
        </div>
      ))}
    </div>
  );
};

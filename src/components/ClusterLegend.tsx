import { cn } from "@/lib/utils";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { clusterColors } from "./clusterColors";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const ClusterLegend = () => {
  const clusterAssignment = useViewModelStore(
    (state) => state.clusterAssignment
  );
  const clusterAssignmentHistoryDepth = useViewSettingsStore(
    (state) => state.clusterAssignmentHistoryDepth
  );
  const clusterAssignmentHistory = useViewModelStore(
    (state) => state.clusterAssignmentHistory
  ).slice(0, clusterAssignmentHistoryDepth);

  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex flex-col-reverse w-full">
        {clusterAssignmentHistory.map(({ timestamp, entries }, index) => {
          const opacity = (
            (clusterAssignmentHistory.length - index) /
            (clusterAssignmentHistory.length + 3)
          ).toFixed(2);

          return (
            <div
              key={`${timestamp}-${index}`}
              style={{ opacity }}
              className={cn("w-full")}
            >
              <LegendBar entries={entries} />
            </div>
          );
        })}
      </div>
      <LegendBar entries={clusterAssignment} />
    </div>
  );
};

const LegendBar = ({ entries }: { entries: [string, number][] }) => {
  return (
    <div className="flex flex-row flex-shrink items-center  overflow-hidden">
      {entries.map(([name, styleGroup], index) => (
        <TooltipProvider key={`${name}-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  clusterColors[styleGroup % clusterColors.length],
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
  );
};

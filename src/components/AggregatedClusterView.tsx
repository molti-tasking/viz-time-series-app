import { cn } from "@/lib/utils";
import { useRawDataStore } from "@/store/useRawDataStore";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import {
  utcDay,
  utcFormat,
  utcHour,
  utcMinute,
  utcMonth,
  utcSecond,
  utcWeek,
  utcYear,
} from "d3";
import { useEffect } from "react";
import { clusterColors } from "./clusterColors";

export const AggregatedClusterView = () => {
  const values = useRawDataStore((state) => state.values);

  const presentationSettings = useViewSettingsStore();

  const { clustersInTime, processClustersInTimeData } = useViewModelStore();

  useEffect(() => {
    processClustersInTimeData();
  }, [presentationSettings, values]);
  const interestingTimestampIndizes = [
    0,
    Math.floor(clustersInTime.length / 4),
    Math.floor(clustersInTime.length / 2),
    Math.floor((clustersInTime.length * 3) / 4),
    clustersInTime.length - 1,
  ];

  return (
    <div className="flex flex-1 flex-row w-full my-2 pb-8 relative">
      {clustersInTime.map(({ timestamp, clusters }, groupIndex) => (
        <div
          key={`${groupIndex}-${timestamp}`}
          className={cn(
            "flex flex-1 flex-col flex-shrink items-center overflow-hidden ",
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

          {!!interestingTimestampIndizes.includes(groupIndex) && (
            <div
              className={cn(
                "overflow-visible absolute",
                "bottom-0",
                "h-8 p-2 rounded-sm text-xs"
              )}
            >
              {multiFormat(new Date(Number(timestamp)))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const formatMillisecond = utcFormat(".%L"),
  formatSecond = utcFormat(":%S"),
  formatMinute = utcFormat("%I:%M"),
  formatHour = utcFormat("%I %p"),
  formatDay = utcFormat("%a %d"),
  formatWeek = utcFormat("%b %d"),
  formatMonth = utcFormat("%B"),
  formatYear = utcFormat("%Y");

function multiFormat(date: Date) {
  return (
    utcSecond(date) < date
      ? formatMillisecond
      : utcMinute(date) < date
        ? formatSecond
        : utcHour(date) < date
          ? formatMinute
          : utcDay(date) < date
            ? formatHour
            : utcMonth(date) < date
              ? utcWeek(date) < date
                ? formatDay
                : formatWeek
              : utcYear(date) < date
                ? formatMonth
                : formatYear
  )(date);
}

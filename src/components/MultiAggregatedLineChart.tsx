import { useRawDataStore } from "@/store/useRawDataStore";
import { useViewModelStore } from "@/store/useViewModelStore";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { AlertCircleIcon } from "lucide-react";
import { memo, useEffect } from "react";
import { PlotlyChart } from "./charts/PlotlyChart";
import { VegaLiteChart } from "./charts/VegaLiteChart";
import { clusterColors } from "./clusterColors";
import { ClusterLegend } from "./ClusterLegend";

// TODO: Make this chart mostly recursive in a way that a user sees a subset whenever he selects one of those charts

export const MultiAggregatedLineChart = () => {
  const values = useRawDataStore((state) => state.values);
  // const dimensions = useRawDataStore((state) => state.dimensions);

  const presentationSettings = useViewSettingsStore();

  const processData = useViewModelStore((state) => state.processData);

  useEffect(() => {
    processData();
  }, [presentationSettings, values]);

  return (
    <>
      <ClusterLegend />

      <div className="flex-1 flex flex-col gap-2 overflow-scroll">
        <Charts />
        {/* <PlotlyChart /> */}
        {/* {aggregated.map((val, index) => (
          <AggregatedLineChart
            values={val}
            key={index}
            className={colors[index % colors.length]}
            yDomain={yDomain}
            presentationSettings={presentationSettings}
          />
        ))} */}
      </div>
    </>
  );
};

const Charts = memo(() => {
  /**
   * This is a list of entries that again are a list of multiple values representing a multiline chart. So this data should be used to render multiple Muli-Line-Charts
   *
   * It can be more than 30 charts that are getting updated every second.
   */
  const aggregated = useViewModelStore((state) => state.aggregated);
  const yDomain = useViewModelStore((state) => state.yDomain);

  const mode = useViewSettingsStore((state) => state.mode);
  const saveScreenSpace = useViewSettingsStore(
    (state) => "saveScreenSpace" in state && state.saveScreenSpace
  );
  if (mode === "plotly") {
    // From plotly docs: https://plotly.com/python/webgl-vs-svg/

    //// Context limits: browsers impose a strict limit on the number of WebGL "contexts" that any given web document can access.
    //// WebGL-powered traces in plotly can use multiple contexts in some cases but as a general rule, it may not be possible to
    //// render more than 8 WebGL-involving figures on the same page at the same time.

    // So we are going to only render the first 8 ones :-(
    const plotlyMaxNumberOfPlots = 8;

    if (aggregated.length > plotlyMaxNumberOfPlots) {
      return (
        <>
          {aggregated.slice(0, plotlyMaxNumberOfPlots).map((val, index) => (
            <PlotlyChart
              values={val}
              key={index}
              className={clusterColors[index % clusterColors.length]}
              yDomain={yDomain}
              mode={mode}
              saveScreenSpace={saveScreenSpace}
            />
          ))}
          <div className="bg-orange-400 p-4 mt-2 rounded-md flex flex-row items-center gap-4 text-white">
            <AlertCircleIcon />
            <span>
              There are {aggregated.length - plotlyMaxNumberOfPlots} more
              clusters, that are not shown.
            </span>
          </div>
        </>
      );
    }
    return (
      <>
        {aggregated.map((val, index) => (
          <PlotlyChart
            values={val}
            key={index}
            className={clusterColors[index % clusterColors.length]}
            yDomain={yDomain}
            mode={mode}
            saveScreenSpace={saveScreenSpace}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {aggregated.map((val, index) => (
        <VegaLiteChart
          values={val}
          key={index}
          className={clusterColors[index % clusterColors.length]}
          yDomain={yDomain}
          mode={mode}
          saveScreenSpace={saveScreenSpace}
        />
      ))}
    </>
  );
});

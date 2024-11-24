import { ClusteringWorker } from "@/lib/clustering.worker";
import * as Comlink from "comlink";
import _ from "lodash";
import { create } from "zustand";
import { useRawDataStore } from "./useRawDataStore";
import { useViewSettingsStore } from "./useViewSettingsStore";

import Worker from "../lib/clustering.worker?worker";

interface DataStore {
  aggregated: Record<string, number>[][];
  yDomain: [number, number];
  colsAccordingToAggregation: [string, number][];

  processData: () => void;
}

const workerInstance = new Worker({ name: "aggregator" });
const workerApi = Comlink.wrap<ClusteringWorker>(workerInstance);

export const useViewModelStore = create<DataStore>((set) => {
  console.log("init view model store");

  const throttledDataProcess = _.throttle(async () => {
    console.count("Throttled process data");
    const timerName = Date.now();

    console.time("ViewModel process duration " + String(timerName));
    const dimensions = useRawDataStore.getState().dimensions;
    const values = useRawDataStore.getState().values;
    const { updateSettings, ...presentationSettings } =
      useViewSettingsStore.getState();
    console.log("Settings: ", presentationSettings);

    const aggregated = await workerApi.aggregator(
      values,
      dimensions,
      presentationSettings
    );
    console.timeEnd("ViewModel process duration " + String(timerName));

    set(aggregated);
  }, 2000);

  return {
    aggregated: [],
    yDomain: [0, 10],
    colsAccordingToAggregation: [],

    processData: async () => {
      console.count("Process data with worker");
      throttledDataProcess();
    },
  };
});

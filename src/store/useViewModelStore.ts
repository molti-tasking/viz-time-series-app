import { ClusteringWorker } from "@/lib/clustering.worker";
import * as Comlink from "comlink";
import _ from "lodash";
import { create } from "zustand";
import { useRawDataStore } from "./useRawDataStore";
import { useViewSettingsStore } from "./useViewSettingsStore";

import { ClusterView } from "@/lib/clusteringOverTime";
import Worker from "../lib/clustering.worker?worker";

interface DataStore {
  aggregated: Record<string, number>[][];
  yDomain: [number, number];
  clusterAssignment: [string, number][];
  clusterAssignmentHistory: {
    timestamp: number;
    entries: [string, number][];
  }[];

  /**
   * This data is needed only for certain views. It should only be calculated when needed.
   */
  clustersInTime: ClusterView[];

  processData: () => void;
  processClustersInTimeData: () => void;
}

const workerInstance = new Worker({ name: "aggregator" });
const workerApi = Comlink.wrap<ClusteringWorker>(workerInstance);

export const useViewModelStore = create<DataStore>((set, get) => {
  console.log("init view model store");

  const throttledDataProcess = _.throttle(async () => {
    const timerName = Date.now();

    console.time("ViewModel basic data process duration " + String(timerName));
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
    console.timeEnd(
      "ViewModel basic data process duration " + String(timerName)
    );
    const lastTimestamp = values[values.length - 1]["timestamp"] ?? Date.now();
    const entries = get().clusterAssignment;
    const clusterAssignmentHistory = get().clusterAssignmentHistory;
    const updatedClusterAssignmentHistory = clusterAssignmentHistory.toSpliced(
      0,
      0,
      { timestamp: lastTimestamp, entries }
    );

    set({
      ...aggregated,
      clusterAssignmentHistory: updatedClusterAssignmentHistory,
    });
  }, 2000);

  const throttledClustersInTimeProcess = _.throttle(async () => {
    const timerName = Date.now();

    console.time(
      "ViewModel cluster in time process duration " + String(timerName)
    );
    const dimensions = useRawDataStore.getState().dimensions;
    const values = useRawDataStore.getState().values;
    const { updateSettings, ...presentationSettings } =
      useViewSettingsStore.getState();
    console.log("Settings: ", presentationSettings);

    const { clustersInTime } = await workerApi.clusteringOverTime(
      values,
      dimensions,
      presentationSettings
    );

    console.timeEnd(
      "ViewModel cluster in time process duration " + String(timerName)
    );

    set({ clustersInTime });
  }, 10000);

  return {
    aggregated: [],
    yDomain: [0, 10],
    clusterAssignment: [],
    clusterAssignmentHistory: [],
    clustersInTime: [],

    processData: throttledDataProcess,
    processClustersInTimeData: throttledClustersInTimeProcess,
  };
});

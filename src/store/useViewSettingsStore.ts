import { ChartPresentationSettings } from "@/lib/ChartPresentationSettings";
import { create } from "zustand";
import { useRawDataStore } from "./useRawDataStore";

export type ViewSettingsStore = ChartPresentationSettings & {
  updateSettings: (
    newSettings: (val: ChartPresentationSettings) => ChartPresentationSettings
  ) => void;
};

export const useViewSettingsStore = create<ViewSettingsStore>((set, get) => {
  const dataTicks = Math.min(useRawDataStore.getState().values.length, 50);
  return {
    eps: 8,
    dataTicks,
    clusterAssignmentHistoryDepth: 5,
    mode: "multiline",
    ignoreBoringDataMode: "off",

    updateSettings: (newSettings) => {
      const newValues = newSettings(get());
      set(newValues);
    },
  };
});

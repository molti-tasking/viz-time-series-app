import { create } from "zustand";
import { useRawDataStore } from "./useRawDataStore";
import { ChartPresentationSettings } from "@/lib/ChartPresentationSettings";

export type ViewSettingsStore = ChartPresentationSettings & {
  updateSettings: (
    newSettings: (val: ChartPresentationSettings) => ChartPresentationSettings
  ) => void;
};

export const useViewSettingsStore = create<ViewSettingsStore>((set, get) => {
  const dataTicks = useRawDataStore.getState().values.length ?? 20;
  return {
    eps: 8,
    dataTicks,
    mode: "multiline",
    ignoreBoringDataMode: "standard",
    meanRange: 0.1,
    tickRange: 8,

    updateSettings: (newSettings) => {
      const newValues = newSettings(get());
      set(newValues);
    },
  };
});

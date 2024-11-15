import { ChartPresentationSettings } from "@/lib/ChartPresentationSettings";
import { ClassValue } from "clsx";

export type ChartProps = {
  values: Record<string, number>[];
  className: ClassValue;
  yDomain: [number, number];
  saveScreenSpace?: boolean;
  mode: ChartPresentationSettings["mode"];
};

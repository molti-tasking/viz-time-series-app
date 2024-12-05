"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPresentationSettings } from "@/lib/ChartPresentationSettings";
import { cn } from "@/lib/utils";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function ClusterChartPreferencesPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button>
          <ChevronDownIcon /> Configure Presentation
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-screen-sm w-full z-[2000]">
        <SettingsForm onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

const chartViewOptions: Record<ChartPresentationSettings["mode"], string> = {
  multiline: "Multiline",
  envelope: "Envelope",
  plotly: "Plotly (GL)",
  clusters: "Clusters (NEW)",
};

const ignoreBoringDataModeOptions: Record<
  ChartPresentationSettings["ignoreBoringDataMode"],
  string
> = {
  off: "Off",
  standard: "Standard",
};

const SettingsForm = ({ onClose }: { onClose: () => void }) => {
  const viewSettings = useViewSettingsStore();
  const { updateSettings, ...settings } = viewSettings;

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="text-lg font-medium leading-none">
          Data Presentation Settings
        </h4>
        <p className="text-sm text-muted-foreground">
          Set the desired filters for your data.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 items-start">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="clusterCount">Cluster Count</Label>
          <Input
            type="number"
            id="clusterCount"
            placeholder="Cluster Count"
            disabled={"eps" in settings && !!settings.eps}
            value={
              "clusterCount" in settings ? settings.clusterCount : undefined
            }
            onChange={(e) =>
              updateSettings((curr) => ({
                ...curr,
                eps: undefined,
                clusterCount: e.target.valueAsNumber ?? undefined,
              }))
            }
          />
          <p className={cn("text-sm text-muted-foreground")}>
            Define the amount of different charts the date should be grouped
            into.
          </p>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="similarityThreshold">Similarity Threshold</Label>
          <Input
            type="number"
            id="similarityThreshold"
            placeholder="Similarity Threshold"
            step={0.1}
            disabled={"clusterCount" in settings && !!settings.clusterCount}
            value={"eps" in settings ? settings.eps : undefined}
            onChange={(e) =>
              updateSettings((curr) => ({
                ...curr,
                clusterCount: undefined,
                eps: e.target.valueAsNumber ?? undefined,
              }))
            }
          />
          <p className={cn("text-sm text-muted-foreground")}>
            Define the threshold of how similar one cluster should be. The
            smaller the value, the more clusters you will have.
          </p>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 items-start">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="dataTicks">Data Ticks</Label>
          <Input
            type="number"
            id="dataTicks"
            placeholder="Data Ticks"
            value={settings.dataTicks}
            onChange={(e) =>
              updateSettings((curr) => ({
                ...curr,
                dataTicks: e.target.valueAsNumber,
              }))
            }
          />
          <p className={cn("text-sm text-muted-foreground")}>
            Define the amount of how many latest timestamps should be displayed
            or not.
          </p>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="clusterAssignmentHistoryDepth">
            Cluster Assignment History Depth
          </Label>
          <Input
            type="number"
            id="clusterAssignmentHistoryDepth"
            placeholder="Cluster Assignment History Depth"
            value={settings.clusterAssignmentHistoryDepth}
            onChange={(e) =>
              updateSettings((curr) => ({
                ...curr,
                clusterAssignmentHistoryDepth: e.target.valueAsNumber,
              }))
            }
          />
          <p className={cn("text-sm text-muted-foreground")}>
            Define the amount of how many cluster assignment history layers
            should be displayed.
          </p>
        </div>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="chartViewMode">Chart View Mode</Label>
        <Tabs
          id="chartViewMode"
          value={settings.mode}
          onValueChange={(mode) =>
            updateSettings((curr) => ({
              ...curr,
              mode: mode as ChartPresentationSettings["mode"],
            }))
          }
        >
          <TabsList>
            {Object.entries(chartViewOptions).map(([key, label]) => (
              <TabsTrigger value={key} key={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Label htmlFor="ignoreBoringDataMode">Ignore boring data mode</Label>
      <Tabs
        id="ignoreBoringDataMode"
        value={settings.ignoreBoringDataMode}
        onValueChange={(mode) =>
          updateSettings((curr) => ({
            ...curr,
            ignoreBoringDataMode:
              mode as ChartPresentationSettings["ignoreBoringDataMode"],
          }))
        }
      >
        <TabsList>
          {Object.entries(ignoreBoringDataModeOptions).map(([key, label]) => (
            <TabsTrigger value={key} key={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="standard" className="grid w-full gap-2">
          <div className="grid w-full grid-cols-2 gap-2 items-start">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="meanRange">Relative mean range</Label>
              <Input
                type="number"
                id="meanRange"
                placeholder="Mean range"
                step={0.05}
                min={0.0}
                max={0.9999}
                value={"meanRange" in settings ? settings.meanRange : undefined}
                onChange={(e) =>
                  updateSettings((curr) => ({
                    ...curr,
                    meanRange: e.target.valueAsNumber,
                  }))
                }
              />
              <p className={cn("text-sm text-muted-foreground")}>
                Define the relative sensitivity in a way of how much data has to
                be away from the mean of the respective data ticks in order to
                be significant enough to be displayed.
              </p>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="tickRange">Tick range</Label>
              <Input
                type="number"
                id="tickRange"
                placeholder="Tick range"
                value={"tickRange" in settings ? settings.tickRange : undefined}
                onChange={(e) =>
                  updateSettings((curr) => ({
                    ...curr,
                    tickRange: e.target.valueAsNumber,
                  }))
                }
              />
              <p className={cn("text-sm text-muted-foreground")}>
                Define the amount of data points that are considered to define a
                mean value.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveScreenSpace"
              checked={
                "saveScreenSpace" in settings
                  ? settings.saveScreenSpace
                  : undefined
              }
              onCheckedChange={(checked) =>
                updateSettings((curr) => ({
                  ...curr,
                  saveScreenSpace: checked,
                }))
              }
            />
            <label
              htmlFor="saveScreenSpace"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Save screen space but hiding time periods without significant
              data.
            </label>
          </div>
        </TabsContent>
      </Tabs>

      {/* <div className="grid w-full max-w-sm items-center gap-1.5">
        <div>
          <div>
            <Label htmlFor="fromTime">From</Label>
            <Input
              type="time"
              id="fromTime"
              placeholder="Start Time"
              value={settings.timeScale?.from}
              onChange={(e) =>
                updateSettings((curr) => ({
                  ...curr,
                  timeScale: {
                    ...curr.timeScale,
                    from: e.target.valueAsDate?.getMilliseconds(),
                  },
                }))
              }
            />
          </div>
        </div>
        <p className={cn("text-sm text-muted-foreground")}>
          Define the time scale you want to display.
        </p>
      </div> */}

      <div>
        <Button variant={"outline"} onClick={() => onClose()}>
          Close
        </Button>
      </div>
    </div>
  );
};

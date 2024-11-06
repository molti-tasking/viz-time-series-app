"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPresentationSettings } from "@/lib/clustering";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ChartPresentationSettingsPopoverProps {
  settings: ChartPresentationSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChartPresentationSettings>>;
}

export function ChartPresentationSettingsPopover(
  props: ChartPresentationSettingsPopoverProps
) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <ChevronDownIcon /> Configure Presentation
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 z-[2000]">
        <ChartPresentationSettingsForm
          onClose={() => setOpen(false)}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}

const chartViewOptions: Record<ChartPresentationSettings["mode"], string> = {
  multiline: "Multiline",
  envelope: "Envelope",
  horizon: "Horizon (tbd.)",
};

const ChartPresentationSettingsForm = ({
  onClose,
  settings,
  setSettings,
}: {
  onClose: () => void;
} & ChartPresentationSettingsPopoverProps) => {
  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <h4 className="text-lg font-medium leading-none">
          Data Presetation Settings
        </h4>
        <p className="text-sm text-muted-foreground">
          Set the disired filters for your data.
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="clusterCount">Cart View Mode</Label>
        <Tabs
          value={settings.mode}
          onValueChange={(mode) =>
            setSettings((curr) => ({
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
          <TabsContent value="horizon">
            This view is not implemented yet.
          </TabsContent>
        </Tabs>
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
              setSettings((curr) => ({
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
              setSettings((curr) => ({
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

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="dataTicks">Data Ticks</Label>
        <Input
          type="number"
          id="dataTicks"
          placeholder="Data Ticks"
          value={settings.dataTicks}
          onChange={(e) =>
            setSettings((curr) => ({
              ...curr,
              dataTicks: e.target.valueAsNumber,
            }))
          }
        />
        <p className={cn("text-sm text-muted-foreground")}>
          Define the amount of how many latest timestamps should be displayed or
          not.
        </p>
      </div>

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
                setSettings((curr) => ({
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

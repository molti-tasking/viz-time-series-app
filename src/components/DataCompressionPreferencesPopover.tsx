"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DataCompressionPreferences } from "@/lib/wrapping";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DataCompressionPreferencesPopoverProps {
  settings: DataCompressionPreferences;
  setSettings: React.Dispatch<React.SetStateAction<DataCompressionPreferences>>;
}

export function DataCompressionPreferencesPopover(
  props: DataCompressionPreferencesPopoverProps
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
        <SettingsForm onClose={() => setOpen(false)} {...props} />
      </PopoverContent>
    </Popover>
  );
}

const chartViewOptions: Record<DataCompressionPreferences["mode"], string> = {
  multiline: "Multiline",
  envelope: "Envelope",
};

const SettingsForm = ({
  onClose,
  settings,
  setSettings,
}: {
  onClose: () => void;
} & DataCompressionPreferencesPopoverProps) => {
  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <h4 className="text-lg font-medium leading-none">
          Data Presentation Settings
        </h4>
        <p className="text-sm text-muted-foreground">
          Set the preferred settings for the data compression.
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="chartViewMode">Chart View Mode</Label>
        <Tabs
          id="chartViewMode"
          value={settings.mode}
          onValueChange={(mode) =>
            setSettings((curr) => ({
              ...curr,
              mode: mode as DataCompressionPreferences["mode"],
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

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="meanRange">Relative mean range</Label>
        <Input
          type="number"
          id="meanRange"
          placeholder="Mean range"
          step={0.05}
          min={0.0}
          max={0.9999}
          value={settings.meanRange}
          onChange={(e) =>
            setSettings((curr) => ({
              ...curr,
              meanRange: e.target.valueAsNumber,
            }))
          }
        />
        <p className={cn("text-sm text-muted-foreground")}>
          Define the relative sensitivity in a way of how much data has to be
          away from the mean of the respective data ticks in order to be
          significant enough to be displayed.
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="tickRange">Tick range</Label>
        <Input
          type="number"
          id="tickRange"
          placeholder="Tick range"
          value={settings.tickRange}
          onChange={(e) =>
            setSettings((curr) => ({
              ...curr,
              tickRange: e.target.valueAsNumber,
            }))
          }
        />
        <p className={cn("text-sm text-muted-foreground")}>
          Define the amount of data points that are considered to define a mean
          value.
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
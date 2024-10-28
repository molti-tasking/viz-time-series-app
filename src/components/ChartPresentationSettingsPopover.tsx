import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Input } from "./ui/input";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

export interface ChartPresentationSettings {
  clusterCount: number;
  dataTicks?: number;

  timeScale?: {
    from?: number;
    to?: number;
  };
}

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
      <PopoverContent className="w-80">
        <ChartPresentationSettingsForm
          onClose={() => setOpen(false)}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}

const ChartPresentationSettingsForm = ({
  onClose,
  settings,
  setSettings,
}: {
  onClose: () => void;
} & ChartPresentationSettingsPopoverProps) => {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="text-lg font-medium leading-none">
          Data Presetation Settings
        </h4>
        <p className="text-sm text-muted-foreground">
          Set the disired filters for your data.
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="clusterCount">Cluster Count</Label>
        <Input
          type="number"
          id="clusterCount"
          placeholder="Cluster Count"
          value={settings.clusterCount}
          onChange={(e) =>
            setSettings((curr) => ({
              ...curr,
              clusterCount: e.target.valueAsNumber ?? curr.clusterCount,
            }))
          }
        />
        <p className={cn("text-sm text-muted-foreground")}>
          Define the amount of different charts the date should be grouped into.
        </p>
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

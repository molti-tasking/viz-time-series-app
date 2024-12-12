"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartPresentationSettings,
  chartPresentationSettingsSchema,
} from "@/lib/ChartPresentationSettings";
import { useViewSettingsStore } from "@/store/useViewSettingsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";

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
  highlighted: "Highlighted",
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

  const form = useForm<ChartPresentationSettings>({
    resolver: zodResolver(chartPresentationSettingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (data: ChartPresentationSettings) => {
    updateSettings((prevSettings) => ({ ...prevSettings, ...data }));

    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}>
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
            <FormField
              control={form.control}
              name="clusterCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cluster Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Cluster Count"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define the amount of different charts the date should be
                    grouped into.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Similarity Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Similarity Threshold"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define the threshold of how similar one cluster should be.
                    The smaller the value, the more clusters you will have.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid w-full grid-cols-2 gap-2 items-start">
            <FormField
              control={form.control}
              name="dataTicks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Ticks</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Data Ticks" {...field} />
                  </FormControl>
                  <FormDescription>
                    Define the amount of how many latest timestamps should be
                    displayed or not.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clusterAssignmentHistoryDepth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cluster Assignment History Depth</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Cluster Assignment History Depth"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define the amount of how many cluster assignment history
                    layers should be displayed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chart View Mode</FormLabel>
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={(mode) => field.onChange(mode)}
                  >
                    <TabsList>
                      {Object.entries(chartViewOptions).map(([key, label]) => (
                        <TabsTrigger value={key} key={key}>
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ignoreBoringDataMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ignore boring data mode</FormLabel>
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={(mode) => field.onChange(mode)}
                  >
                    <TabsList>
                      {Object.entries(ignoreBoringDataModeOptions).map(
                        ([key, label]) => (
                          <TabsTrigger value={key} key={key}>
                            {label}
                          </TabsTrigger>
                        )
                      )}
                    </TabsList>
                    <TabsContent value="standard" className="grid w-full gap-2">
                      <div className="grid w-full grid-cols-2 gap-2 items-start">
                        <FormField
                          control={form.control}
                          name="meanRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relative mean range</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Relative mean range"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Define the relative sensitivity in a way of how
                                much data has to be away from the mean of the
                                respective data ticks in order to be significant
                                enough to be displayed.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tickRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tick range</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Tick range"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Define the amount of data points that are
                                considered to define a mean value.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="saveScreenSpace"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-4">
                            <div>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <div className="space-y-0.5">
                              <FormLabel>
                                Save screen space but hiding time periods
                                without significant data.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="grid grid-cols-2 gap-4">
            <Button variant={"outline"} onClick={() => onClose()} type="button">
              Close
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

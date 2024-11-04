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
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDataContext } from "./RawDataContext";
import { Input } from "./ui/input";

export function DataSettingsPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="hover:underline">
          <ChevronDownIcon /> Configure Scale
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <SettingsForm onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

const scaleSchema = z.object({
  rows: z.coerce.number(),
  columns: z.coerce.number(),
  streamingInterval: z.coerce.number(),
});

type ScaleFormSchema = z.infer<typeof scaleSchema>;

const SettingsForm = ({ onClose }: { onClose: () => void }) => {
  const {
    dimensions,
    values,
    streamingInterval,
    generateData,
    setStreamingInterval,
  } = useDataContext();

  const defaultValues = {
    rows: values.length,
    columns: dimensions.length,
    streamingInterval: streamingInterval ?? 0,
  };
  console.log(defaultValues);
  const form = useForm<ScaleFormSchema>({
    resolver: zodResolver(scaleSchema),
    defaultValues,
  });

  const onSubmit = async (data: ScaleFormSchema) => {
    const { rows, columns, streamingInterval } = data;
    // We add one column because it's getting sneaked away otherwise. Check implementation in useDataContext to see.
    generateData(rows, columns + 1);
    if (streamingInterval > 0) {
      setStreamingInterval(streamingInterval);
    } else {
      setStreamingInterval(null);
    }

    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-lg font-medium leading-none">Scale</h4>
            <p className="text-sm text-muted-foreground">
              Set the scale for the data.
            </p>
          </div>

          <FormField
            control={form.control}
            name="columns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Columns</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Colums" {...field} />
                </FormControl>
                <FormDescription>
                  This is the amount of parallel time series.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rows"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rows</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Rows" {...field} />
                </FormControl>
                <FormDescription>
                  This is the amount of timestamps for each time series
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="streamingInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Streaming Interval (ms)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Streaming Interval"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the time in milliseconds as in interval in order to
                  append a new row to the data set.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};

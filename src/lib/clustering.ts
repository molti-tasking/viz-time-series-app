export type ChartPresentationSettings = (
  | {
      clusterCount: number;
    }
  | {
      /**
       * A number between 0 and 1 to be used as a percentage and based on it there will be different clusters created, but the resulting cluster count will be unknown
       */
      clusterThreshold: number;
    }
) & {
  mode: "multiline" | "envelope" | "horizon";

  dataTicks?: number;
  timeScale?: { from: number; to: number };
};

type AggregatedProps = {
  aggregated: Record<string, number>[][];
  yDomain: [number, number];
  colsAccordingToAggregation: [string, number][];
};

/**
 * This function is meant to return a ready-to-visualize data set after receiving the raw data and the configuration of how the data should be transformed. One option is the cluster them by defining a threshold
 *
 * @param values A list of multivariate time series entries of type Record<string, number>[] where each record contains a "timestamp" and multiple columns that are the actual time series.
 * @param dimensions Basically the extracted keys of the values and it can be considered the names of the time series, but it is not containing the "timestamp" key itself.
 * @param settings containing parameters that define how the data should be processed and grouped.
 * @returns
 */
export const aggregator = (
  values: Record<string, number>[],
  dimensions: string[],
  settings: ChartPresentationSettings
): AggregatedProps => {
  let clusterCount = 1;
  if ("clusterCount" in settings) {
    clusterCount = settings.clusterCount;
  }

  let dataToBeClustered = values;
  if (settings.dataTicks) {
    dataToBeClustered = values.slice(-1 * settings.dataTicks);
  }

  const aggregated = clustering(dataToBeClustered, clusterCount);

  const colsAccordingToAggregation: [string, number][] = dimensions.map(
    (val) => [
      val,
      aggregated.findIndex((entries) => Object.keys(entries[0]).includes(val)),
    ]
  );

  // Calculate the shared y-axis domain across all clusters
  const allValues = values.flatMap((entries) =>
    Object.entries(entries).flatMap(([key, value]) =>
      key === "timestamp" ? [] : [value]
    )
  );
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yDomain: [number, number] = [yMin, yMax];

  return { aggregated, yDomain, colsAccordingToAggregation };
};

/**
 *
 * @param values Each record in the list has a "timestamp" value and further values.
 * @param groups The length of the return array.
 * @returns A list of list of records. Each record should have again the timestamp value but the further values should be distributed evenly across the list of records.
 */
const clustering = (
  values: Record<string, number>[],
  groups: number
): Record<string, number>[][] => {
  // Prepare the result array with the specified number of groups.
  const res: Record<string, number>[][] = Array.from(
    { length: groups },
    () => []
  );

  // Extract all column names except for 'timestamp'.
  const allColumns = Object.keys(values[0] || {}).filter(
    (key) => key !== "timestamp"
  );

  // Get the last record (we assume the records are sorted by timestamp).
  const lastRecord = values[values.length - 1];

  // Sort the columns by their values in the last record in descending order.
  const sortedColumns = allColumns.sort(
    (a, b) => lastRecord[b] - lastRecord[a]
  );

  // Calculate how many columns per group (distribute as evenly as possible).
  const columnsPerGroup = Math.ceil(sortedColumns.length / groups);

  // Create the column groups based on the sorted order.
  const columnGroups = Array.from({ length: groups }, (_, i) =>
    sortedColumns.slice(i * columnsPerGroup, (i + 1) * columnsPerGroup)
  );

  // Iterate over each record and split into groups based on the column groups.
  values.forEach((record) => {
    columnGroups.forEach((columns, groupIndex) => {
      // Create a new record for the group containing the timestamp and the selected columns.
      const groupRecord: Record<string, number> = {
        timestamp: record.timestamp,
      };
      columns.forEach((col) => {
        if (col in record) {
          groupRecord[col] = record[col];
        }
      });
      // Push the grouped record into the respective group.
      res[groupIndex].push(groupRecord);
    });
  });

  return res;
};

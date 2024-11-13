import { findCommonElements } from "./findCommonElements";
import { findBoringTimestamps } from "./wrapping";

export type ChartPresentationSettings = (
  | {
      clusterCount: number;
    }
  | {
      /**
       * A number between 0 and 1 to be used as a percentage and based on it there will be different clusters created, but the resulting cluster count will be unknown
       */
      eps: number;
    }
) &
  (
    | object
    | {
        /**
         * This value is a threshold. Whenever one of the values of a given range is outside of the a relative range apart from the mean, it will be considered as significant. Should be a number between 0 and 1.
         *
         */
        meanRange: number;
        /**
         * Ticks to be taken into account for the check if there is a relevant threshold. Should be at least 3.
         * @default 3
         */
        tickRange: number;

        // TODO implement a "saveScreenSpace" option
      }
  ) & {
    mode: "multiline" | "envelope";

    dataTicks?: number;
    timeScale?: { from: number; to: number };

    ignoreBoringDataMode: "off" | "standard";
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
export const aggregatorB = (
  rawData: Record<string, number>[],
  dimensions: string[],
  settings: ChartPresentationSettings
): AggregatedProps => {
  // ----------------
  // Filtering data to time
  // ----------------
  let dataToBeClustered = rawData;
  if (settings.dataTicks) {
    dataToBeClustered = rawData.slice(-1 * settings.dataTicks);
  }

  // ----------------
  // Clustering data
  // ----------------

  let aggregated: Record<string, number>[][] = [dataToBeClustered];
  if ("eps" in settings && !!settings.eps) {
    // Here we are first putting all the different entries that are grouped by timestamp into another representation which is grouped by column. This way it will be easier to calculate a distance between those later on.
    // Convert entries grouped by timestamp into a representation grouped by column for easier distance calculation
    const allTimeSeries: [string, Record<number, number>][] = dimensions.map(
      (dimension) => {
        const timeSeries: Record<number, number> = {};

        for (let i = 0; i < dataToBeClustered.length; i++) {
          const curr = dataToBeClustered[i];
          timeSeries[curr.timestamp] = curr[dimension];
        }

        return [dimension, timeSeries];
      }
    );

    // We let the clustering algorithm do the magic and return us the clusters.
    const clusters: [string, Record<number, number>][][] = clusteringDBSCAN(
      allTimeSeries,
      settings.eps
    );

    const timelineNameCount = clusters.reduce(
      (prev, curr) => prev + curr.length,
      0
    );

    if (timelineNameCount !== dimensions.length) {
      alert("Somehow we have missing timelines");
    }

    // We have to bring these column grouped clusters now again in the structure that they are grouped by column. This way they are required in order to be displayed properly
    aggregated = clusters.map((cluster) => {
      const timestamps = Object.keys(cluster[0][1]);
      const result = [];

      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = Number(timestamps[i]);
        const entry: Record<string, number> = { timestamp };

        for (let j = 0; j < cluster.length; j++) {
          const [colName, values] = cluster[j];
          entry[colName] = values[timestamp];
        }

        result.push(entry);
      }

      return result;
    });
  } else if ("clusterCount" in settings && !!settings.clusterCount) {
    aggregated = clustering(dataToBeClustered, settings.clusterCount);
  }

  // ----------------
  // Wrapping of boring data now after we clustered it.
  // ----------------
  if (
    settings.ignoreBoringDataMode === "standard" &&
    "meanRange" in settings &&
    !!settings.meanRange &&
    "tickRange" in settings &&
    !!settings.tickRange
  ) {
    // Map all cluster dimensions because we need them later in order to set the values to undefined if needed.
    const clustersDimensions: string[][] = [];
    for (
      let clusterIndex = 0;
      clusterIndex < aggregated.length;
      clusterIndex++
    ) {
      const cluster = aggregated[clusterIndex];
      const dims = Object.keys(cluster[0] || {}).filter(
        (key) => key !== "timestamp"
      );
      clustersDimensions.push(dims);
    }

    // 1. Get unimportant data areas for each cluster
    const allBoringValues = aggregated.map((aggregatedValues, index) =>
      findBoringTimestamps(
        aggregatedValues,
        clustersDimensions[index],
        settings
      )
    );
    // 2. Get the unimportant data areas that all clusters have in common
    const commonBoringData = findCommonElements(allBoringValues).sort();

    // 3. Set those data points to undefined

    if (commonBoringData.length) {
      // Filter all timestamps upfront for better readability
      const allTimestamps = [];
      for (
        let entryIndex = 0;
        entryIndex < aggregated[0].length;
        entryIndex++
      ) {
        const element = aggregated[0][entryIndex];
        allTimestamps.push(element["timestamp"]);
      }

      const newAggregated: Record<string, number>[][] = [];
      for (
        let clusterIndex = 0;
        clusterIndex < aggregated.length;
        clusterIndex++
      ) {
        newAggregated.push([]); // using this loop to also initialize the new aggregated empty array
      }

      let wasPrevBoring = false;
      // IMPORTANT: We have to know that all aggregated clusters have the same timestamps and also all of them have to be in the same order!
      for (
        let entryIndex = 0;
        entryIndex < allTimestamps.length;
        entryIndex++
      ) {
        const timestamp = allTimestamps[entryIndex];
        const isUnimportantData = commonBoringData.includes(timestamp);

        if (isUnimportantData) {
          // TODO: Make this optional based on the "saveScreenSpace" variable
          // If previous value was also boring, we don't insert even a new value. If prev was not boring, this is just first one being boring so it should be having only nullable values in order to show some "empty space" to the user later on.
          if (wasPrevBoring) {
          } else {
            // Set value undefined for each cluster values
            for (
              let clusterIndex = 0;
              clusterIndex < aggregated.length;
              clusterIndex++
            ) {
              // This has to be defined like this in order to create a new object, rather than just copying the reference.
              const undefinedObject: Record<string, number | undefined> = {
                ...aggregated[clusterIndex][entryIndex],
              };
              const clusterDimensions = clustersDimensions[clusterIndex];
              for (
                let dimensionIndex = 0;
                dimensionIndex < clusterDimensions.length;
                dimensionIndex++
              ) {
                const dimension = clusterDimensions[dimensionIndex];
                undefinedObject[dimension] = undefined;
              }

              newAggregated[clusterIndex].push(
                undefinedObject as Record<string, number>
              );
            }

            wasPrevBoring = true;
          }
        } else {
          for (
            let clusterIndex = 0;
            clusterIndex < aggregated.length;
            clusterIndex++
          ) {
            // Value is not boring, it is significant so we add to new aggregated values
            newAggregated[clusterIndex].push(
              aggregated[clusterIndex][entryIndex]
            );
          }
          wasPrevBoring = false;
        }
      }

      aggregated = newAggregated;
    }
  }

  // ----------------
  // Getting meta data, like all cols and y-domain
  // ----------------

  const colsAccordingToAggregation: [string, number][] = dimensions.map(
    (val) => [
      val,
      aggregated.findIndex((entries) => Object.keys(entries[0]).includes(val)),
    ]
  );

  // Calculate the shared y-axis domain across all clusters
  const allValues = dataToBeClustered.flatMap((entries) =>
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

/**
 * DBSCAN-based clustering function to group data points based on density.
 *
 */
const clusteringDBSCAN = (
  values: [string, Record<number, number>][],
  eps: number
): [string, Record<number, number>][][] => {
  const clusters: [string, Record<number, number>][][] = [];

  const visited = new Array(values.length).fill(false);
  const clustered = new Array(values.length).fill(false); // Track if a point is already in a cluster

  // Euclidean distance calculation
  const calculateDistance = (
    pointA: [string, Record<number, number>],
    pointB: [string, Record<number, number>]
  ): number => {
    let sum = 0;
    for (const entry in pointA[1]) {
      sum += (pointA[1][Number(entry)] - pointB[1][Number(entry)]) ** 2;
    }
    return Math.sqrt(sum);
  };

  // Find all neighbors within eps distance
  const getNeighbors = (pointIndex: number): number[] => {
    const neighbors: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (
        i !== pointIndex &&
        calculateDistance(values[pointIndex], values[i]) <= eps
      ) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  // Recursive function to expand cluster
  const expandCluster = (
    cluster: [string, Record<number, number>][],
    pointIndex: number,
    neighbors: number[]
  ): void => {
    // Add point to cluster and mark it as clustered
    cluster.push(values[pointIndex]);
    clustered[pointIndex] = true;

    for (let i = 0; i < neighbors.length; i++) {
      const neighborIndex = neighbors[i];

      if (!visited[neighborIndex]) {
        visited[neighborIndex] = true;
        const newNeighbors = getNeighbors(neighborIndex);

        if (newNeighbors.length >= eps) {
          // Use eps as minPoints-like threshold for neighbors
          neighbors.push(...newNeighbors);
        }
      }

      // Add to cluster only if not already in a cluster
      if (!clustered[neighborIndex]) {
        cluster.push(values[neighborIndex]);
        clustered[neighborIndex] = true; // Mark as clustered
      }
    }
  };

  for (let i = 0; i < values.length; i++) {
    if (visited[i] || clustered[i]) continue; // Skip if visited or already in a cluster

    visited[i] = true;
    const neighbors = getNeighbors(i);

    const cluster: [string, Record<number, number>][] = [];
    expandCluster(cluster, i, neighbors);

    // Only add non-empty clusters
    if (cluster.length > 0) clusters.push(cluster);
  }

  return clusters;
};

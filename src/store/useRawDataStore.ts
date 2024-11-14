import { create } from "zustand";

interface DataStore {
  mode: "random" | "peaks";
  dimensions: string[];
  values: Record<string, number>[];
  streamingInterval: number | null;
  intervalId: NodeJS.Timeout | null;

  updateData: (
    mode: "random" | "peaks",
    columnCount: number,
    rowCount: number,
    streamingInterval?: number
  ) => void;
}

export const useRawDataStore = create<DataStore>((set, get) => ({
  mode: "random",
  dimensions: [],
  values: [],
  streamingInterval: null,
  intervalId: null,

  updateData: (mode, columnCount, rowCount, streamingInterval) => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ mode, streamingInterval, values: [], dimensions: [] });
    generateData(columnCount, rowCount);
    if (streamingInterval) {
      const newIntervalId = setInterval(() => {
        console.log("Stream update");
        streamDataUpdate();
      }, streamingInterval);
      set({ intervalId: newIntervalId });
    }
  },
}));

// ----------------
// DATA GENERATION
// ----------------

const generateData = (columns: number, rows: number, min = 5, max = 10) => {
  const mode = useRawDataStore.getState().mode;
  const newColumns = [
    "timestamp",
    ...Array.from({ length: columns - 1 }, (_, index) => `Col ${index + 1}`),
  ];
  let newData: number[][] = [];
  if (mode === "random") {
    newData = generateRandomTestData(columns, rows, min, max);
  } else if (mode === "peaks") {
    newData = generatePeakTestData(columns, rows, min, max);
  }

  const values = newData.map((row) =>
    newColumns.reduce(
      (prev, curr, i) => ({ ...prev, [curr]: row[i] }),
      {} as Record<string, number>
    )
  );
  useRawDataStore.setState({
    values,
    dimensions: newColumns.filter((col) => col !== "timestamp"),
  });
};

const streamDataUpdate = () => {
  const { values, mode } = useRawDataStore.getState();
  const lastRow = values[values.length - 1];

  if (!lastRow) return;

  const newRow: Record<string, number> = {
    timestamp: lastRow.timestamp + 1000 + (Math.random() - 0.5) * 200,
  };

  if (mode === "random") {
    Object.keys(lastRow).forEach((key) => {
      if (key !== "timestamp") {
        const prevValue = lastRow[key];

        newRow[key] = getRandomNextValue(prevValue);
      }
    });
  } else if (mode === "peaks") {
    const lastRowWithoutTimestamp = Object.entries(lastRow).filter(
      ([key]) => key !== "timestamp"
    );
    const prevValues = lastRowWithoutTimestamp.map(([, v]) => v);
    const newValues = generateNextPeakTestData(prevValues);
    lastRowWithoutTimestamp.forEach(([key], indx) => {
      newRow[key] = newValues[indx];
    });
  }

  // Add new row to values
  useRawDataStore.setState((state) => ({
    values: [...state.values, newRow],
  }));
};

// Helper functions
const getRandomNextValue = (prev: number) => {
  return Math.random() > 0.5
    ? prev * (1 + Math.random() * Math.random() * 0.3)
    : prev *
        (1 - Math.random() * Math.random() * Math.random() * Math.random());
};

const generateRandomTestData = (
  columnsCount: number,
  rowsCount: number,
  min: number,
  max: number
) => {
  const startTime = Date.now();
  return Array.from<number[][]>({ length: rowsCount }).reduce((prev, _, i) => {
    const timestamp = startTime + i * 1000;
    const randomValues =
      i > 0
        ? prev[i - 1].slice(1).map(getRandomNextValue)
        : Array.from(
            { length: columnsCount - 1 },
            () => Math.random() * (max - min) + min
          );
    const row = [timestamp, ...randomValues];
    return [...prev, row];
  }, [] as number[][]);
};

let peakActive = false;
let peakDecayCounter = 0;
let peakDuration = 0;
let baselineValues: number[] = [];

const generateNextPeakTestData = (
  /**
   * Array of previous value, it should not include a timestamp
   */
  previousValues: number[]
) => {
  let randomValues: number[];

  if (peakActive) {
    if (peakDecayCounter > 0) {
      randomValues = previousValues.map(
        (value, index) =>
          value - (value - baselineValues[index]) * (0.2 + Math.random() * 0.1)
      );

      peakDecayCounter--;
      if (peakDecayCounter === 0) peakActive = false;
    } else {
      randomValues = previousValues.map(
        (value) => value * (1 + Math.random() * 0.2)
      );

      peakDecayCounter = peakDuration;
    }
  } else {
    randomValues = previousValues.map((value, index) => {
      baselineValues[index] += (Math.random() - 0.5) * 0.02;
      return value * (1 + (Math.random() - 0.5) * 0.03);
    });

    if (Math.random() < 0.05) {
      peakActive = true;
      peakDuration = Math.floor(5 + Math.random() * 5);
      randomValues = previousValues.map(
        (value) => value * (1 + Math.random() * Math.random() * 0.5)
      );
    }
  }

  return randomValues;
};

const generatePeakTestData = (
  columnsCount: number,
  rowsCount: number,
  min: number,
  max: number
) => {
  const startTime = Date.now();
  peakActive = false;
  peakDecayCounter = 0;
  peakDuration = 0;
  baselineValues = [];
  return Array.from<number[][]>({ length: rowsCount }).reduce((prev, _, i) => {
    const timestamp = startTime + i * 1000 + (Math.random() - 0.5) * 200;
    let randomValues: number[];
    if (i === 0) {
      randomValues = Array.from(
        { length: columnsCount - 1 },
        () => Math.random() * (max - min) + min
      );
      baselineValues = randomValues.slice();
    } else {
      randomValues = generateNextPeakTestData(prev[i - 1].slice(1));
    }
    return [...prev, [timestamp, ...randomValues]];
  }, [] as number[][]);
};

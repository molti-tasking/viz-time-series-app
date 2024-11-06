import { create } from "zustand";

interface DataStore {
  mode: "random" | "peaks";
  dimensions: string[];
  values: Record<string, number>[];
  streamingInterval: null | number;

  updateData: (
    mode: "random" | "peaks",
    columnCount: number,
    rowCount: number,
    streamingInterval?: number
  ) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  mode: "random",
  dimensions: [],
  values: [],
  streamingInterval: null,

  updateData: (mode, columnCount, rowCount, streamingInterval) => {
    set({ mode, streamingInterval });
    generateData(columnCount, rowCount);
  },
}));

// ----------------
// DATA GENERATION
// ----------------

const generateData = (columns: number, rows: number, min = 5, max = 10) => {
  const mode = useDataStore.getState().mode;
  const newColumns = [
    "timestamp",
    ...Array.from({ length: columns - 1 }, (_, index) => `Col ${index + 1}`),
  ];
  let newData: number[][] = [];
  if (mode === "random") {
    newData = generateRandomTestData(rows, columns, min, max);
  } else if (mode === "peaks") {
    newData = generatePeakTestData(rows, columns, min, max);
  }

  const values = newData.map((row) =>
    newColumns.reduce(
      (prev, curr, i) => ({ ...prev, [curr]: row[i] }),
      {} as Record<string, number>
    )
  );
  useDataStore.setState({
    values,
    dimensions: newColumns.filter((col) => col !== "timestamp"),
  });
};

// Helper functions
const getRandomNextValue = (prev: number) => {
  return Math.random() > 0.5
    ? prev * (1 + Math.random() * Math.random() * 0.3)
    : prev *
        (1 - Math.random() * Math.random() * Math.random() * Math.random());
};

const generateRandomTestData = (
  rowsCount: number,
  columnsCount: number,
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

const generatePeakTestData = (
  rowsCount: number,
  columnsCount: number,
  min: number,
  max: number
) => {
  const startTime = Date.now();
  let peakActive = false;
  let peakDecayCounter = 0;
  let peakDuration = 0;
  let baselineValues: number[] = [];
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
      const previousValues = prev[i - 1].slice(1);
      if (peakActive) {
        if (peakDecayCounter > 0) {
          randomValues = previousValues.map(
            (value, index) =>
              value -
              (value - baselineValues[index]) * (0.2 + Math.random() * 0.1)
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
    }
    const row = [timestamp, ...randomValues];
    return [...prev, row];
  }, [] as number[][]);
};

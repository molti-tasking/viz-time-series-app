import { createContext, useContext, useEffect, useState } from "react";

interface RawDataContextTypes {
  dimensions: string[];
  values: Record<string, number>[];
  streamingInterval: null | number;
  setStreamingInterval: (interval: null | number) => void;
  setData: (newData: number[][]) => void;
  generateData: (
    rows: number,
    columns: number,
    min?: number,
    max?: number
  ) => void;
}

const RawDataContext = createContext<RawDataContextTypes>({
  dimensions: [],
  values: [],
  streamingInterval: null,
  setStreamingInterval: () => alert("Context not implemented."),
  setData: () => alert("Context not implemented."),
  generateData: () => alert("Context not implemented."),
});

export const RawDataContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [streamingInterval, setStreamingInterval] = useState<null | number>(
    null
  );
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<number[][]>([]);

  const generateData = async (
    rowsCount: number,
    columnsCount: number,
    min: number = 5,
    max: number = 10
  ) => {
    const newColumns = [
      "timestamp",
      ...Array.from(
        { length: columnsCount - 1 },
        (_, index) => `Col ${index + 1}`
      ),
    ];
    setColumns(newColumns);

    const getRandomNextValue = (prev: number) => {
      return Math.random() > 0.5
        ? prev * (1 + Math.random() * Math.random() * 0.3)
        : prev *
            (1 - Math.random() * Math.random() * Math.random() * Math.random());
    };

    const startTime = Date.now();

    const newData = Array.from<number[][]>({ length: rowsCount }).reduce(
      (prev, _, i) => {
        const timestamp = startTime + i * 1000;
        const randomValues: number[] =
          i > 0
            ? prev[i - 1].slice(1).map(getRandomNextValue)
            : Array.from(
                { length: columnsCount - 1 },
                () => Math.random() * (max - min) + min
              );

        const row = [timestamp, ...randomValues];
        return [...prev, row];
      },
      [] as number[][]
    );

    setData(newData);
  };

  useEffect(() => {
    if (!data.length) {
      generateData(2, 4);
    }
  }, []);

  useEffect(() => {
    if (streamingInterval === null) return;

    const intervalId = setInterval(() => {
      setData((prevData) => {
        const lastRow = prevData[prevData.length - 1];
        const newTimestamp = lastRow[0] + 1000; // Increment timestamp by 1000ms (1 second)
        const newValues = lastRow
          .slice(1) // Exclude timestamp for value calculations
          .map((value) =>
            Math.random() > 0.5
              ? value * (1 + Math.random() * Math.random() * 0.3)
              : value *
                (1 -
                  Math.random() * Math.random() * Math.random() * Math.random())
          );

        return [...prevData, [newTimestamp, ...newValues]];
      });
    }, streamingInterval);

    return () => clearInterval(intervalId);
  }, [streamingInterval]);

  const dimensions = columns.filter((col) => col !== "timestamp");
  const values = data.map((row) =>
    columns.reduce(
      (prev, curr, i) => ({ ...prev, [curr]: row[i] }),
      {} as Record<string, number>
    )
  );

  return (
    <RawDataContext.Provider
      value={{
        dimensions,
        values,
        setData,
        generateData,
        streamingInterval,
        setStreamingInterval,
      }}
    >
      {children}
    </RawDataContext.Provider>
  );
};

export const useDataContext = () => useContext(RawDataContext);

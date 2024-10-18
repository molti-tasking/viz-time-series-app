import { createContext, useContext, useEffect, useState } from "react";

interface RawDataContextTypes {
  dimensions: string[];
  values: Record<string, number>[];
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
  setData: () => alert("Context not implemented."),
  generateData: () => alert("Context not implemented."),
});

export const RawDataContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<number[][]>([]);

  const generateData = async (
    rowsCount: number,
    columnsCount: number,
    min: number = 5,
    max: number = 10
  ) => {
    // Create column names
    const newColumns = [
      "timestamp",
      ...Array.from(
        { length: columnsCount - 1 },
        (_, index) => `Col ${index + 1}`
      ),
    ];
    setColumns(newColumns);

    const getRandomNextValue = (prev: number) => {
      if (Math.random() > 0.5) {
        return prev * (1 + Math.random() * Math.random() * 0.3);
      } else {
        return (
          prev *
          (1 - Math.random() * Math.random() * Math.random() * Math.random())
        );
      }
    };
    // Generate random data within the given range
    const startTime = Date.now();

    const newData = Array.from<number[][]>({ length: rowsCount }).reduce(
      (prev, _, i) => {
        const timestamp = startTime + i * 1000; // Increment by 1000ms (1 second) per row

        const randomValues: number[] =
          i > 0
            ? prev[i - 1]
                // First is timestamp so we have to slice it out
                .slice(1)
                .map(getRandomNextValue)
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

  const dimensions = columns.filter((col) => col !== "timestamp");
  const values = data.map((row) =>
    columns.reduce(
      (prev, curr, i) => ({ ...prev, [curr]: row[i] }),
      {} as Record<string, number>
    )
  );

  useEffect(() => {
    if (!data.length) {
      generateData(20, 40);
    }
  }, []);
  return (
    <RawDataContext.Provider
      value={{ dimensions, values, setData, generateData }}
    >
      {children}
    </RawDataContext.Provider>
  );
};

export const useDataContext = () => useContext(RawDataContext);

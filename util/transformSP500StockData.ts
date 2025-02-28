/**
 * Parsing the csv data from https://www.kaggle.com/datasets/andrewmvd/sp-500-stocks and transforms to application ready JSON
 */

// Run this file with the following command
// deno run --inspect --allow-read=.  --allow-write  --allow-net util/transformSP500StockData.ts

import { csvParse, timeFormat, timeParse } from "d3";

const parseDate = timeParse("%Y-%m-%d");

const loadStockData = async () => {
  // Read the CSV file as a string
  const fileContent = await Deno.readTextFile("util/sp500_stocks.csv");

  const parsedData = csvParse<keyof StockData>(fileContent);
  console.log("Loading stock data entries: ", parsedData.length);

  const groupedData: Record<
    number,
    {
      [x: string]: number;
      timestamp: number;
    }
  > = {};

  // Prepare the transformed structure
  parsedData.forEach((entry) => {
    const date = entry.Date;

    const relativeDateChange =
      (Number(entry.Open) - Number(entry.Close)) / Number(entry.Close);

    // Parse timestamp
    const parsedDate = parseDate(date);

    if (!parsedDate) {
      alert("Can not parse date: " + date);
      return;
    }
    const timestamp = parsedDate.getTime();

    if (!groupedData[timestamp]) {
      groupedData[timestamp] = { timestamp };
    }
    groupedData[timestamp][entry.Symbol] = relativeDateChange;
  });

  const returnRecords: { timestamp: number; [stockSymbol: string]: number }[] =
    Object.values(groupedData);
  console.log("returnRecords:", returnRecords.length);

  writeDataToFile(JSON.stringify(returnRecords));
};

const formatDate = timeFormat("%Y%m%dT%H:%M");

const writeDataToFile = async (dataString: string) => {
  try {
    const filePath = `./src/data/${formatDate(
      new Date()
    )}_stock_sp500_data.json`;
    await Deno.writeTextFile(filePath, dataString);
    console.log("File written successfully:", filePath);
  } catch (e) {
    console.log("Error writing file: ", e);
  }
};

loadStockData();

//// --------------
//// --------------
//// DATA TYPES
//// --------------
//// --------------

interface StockData {
  Date: string;
  Symbol: string;
  "Adj Close": string;
  Close: string;
  High: string;
  Low: string;
  Open: string;
  Volume: string;
}

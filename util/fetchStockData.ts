// Run this file with the following command
// deno run --inspect --allow-read=.  --allow-write  --allow-net util/fetchStockData.ts

import { timeFormat, timeParse } from "d3";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

console.log("Hello World");
// Load environment variables
const env = config();

const API_KEY = env.ALPHAVANTAGE_API_KEY;

const getUrl = (stockSymbol: string) =>
  `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`;

const parseDate = timeParse("%Y-%m-%d");

const loadStockDataFor = async (...stockSymbols: string[]) => {
  const groupedData: Record<
    number,
    {
      [x: string]: number;
      timestamp: number;
    }
  > = {};

  for await (const stockSymbol of stockSymbols) {
    const url = getUrl(stockSymbol);
    console.log("Fetch data from: ", url);
    const res = await fetch(url);
    console.log("Response Status: ", res.statusText);
    const json: APIReturnType = await res.json();
    console.log("Loaded data for: ", json["Meta Data"]["2. Symbol"]);

    const dates = Object.keys(json["Time Series (Daily)"]);
    console.log("Loading data entries for dates: ", dates.length);

    for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
      const date = dates[dateIndex];

      const timestamp = parseDate(date)?.getTime();
      const values = json["Time Series (Daily)"][date];
      //   console.log("Loading data entry for date: ", date, values);
      const relativeDateChange =
        (Number(values["4. close"]) - Number(values["1. open"])) /
        Number(values["1. open"]);

      if (!timestamp) {
        console.warn("UNDEFINED TIMESTAMP");
        continue;
      }

      if (!groupedData[timestamp]) {
        groupedData[timestamp] = { timestamp };
      }
      groupedData[timestamp][stockSymbol] = relativeDateChange;
    }
  }

  const returnRecords: { timestamp: number; [stockSymbol: string]: number }[] =
    Object.values(groupedData);

  console.log("returnRecords:", returnRecords);
  writeDataToFile(JSON.stringify(returnRecords));
};

const formatDate = timeFormat("%Y%m%dT%H:%M");

const writeDataToFile = async (dataString: string) => {
  try {
    const filePath = `./src/data/${formatDate(new Date())}_stock_data.json`;
    await Deno.writeTextFile(filePath, dataString);
    console.log("File written successfully:", filePath);
  } catch (e) {
    console.log("Error writing file: ", e);
  }
};

loadStockDataFor("AAPL", "IBM");

//// --------------
//// --------------
//// DATA TYPES
//// --------------
//// --------------

interface APIReturnType {
  "Meta Data": MetaData;
  "Time Series (Daily)": TimeSeriesDaily;
}
type TimeSeriesDaily = Record<string, PeriodValues>;

interface MetaData {
  "1. Information": string;
  "2. Symbol": string;
  "3. Last Refreshed": string;
  "4. Output Size": string;
  "5. Time Zone": string;
}

interface PeriodValues {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. volume": string;
}

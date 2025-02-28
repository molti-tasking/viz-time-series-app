/**
 * Parsing the csv data from https://data.un.org/Data.aspx?q=gdp&d=SNAAMA&f=grID%3a101%3bcurrID%3aUSD%3bpcFlag%3a1 and transforms to application ready JSON
 */

// Run this file with the following command
// deno run --inspect --allow-read=.  --allow-write  --allow-net util/transformUNGDPData.ts

import { csvParse, timeFormat, timeParse } from "d3";
import { sanitize } from "./sanitize.ts";

const parseDate = timeParse("%Y");

const loadGDPData = async () => {
  // Read the CSV file as a string
  const fileContent = await Deno.readTextFile(
    "util/UNdata_Export_20250228_174235440.csv"
  );

  const parsedData = csvParse<keyof GDPData>(fileContent);
  console.log("Loading stock data entries: ", parsedData.length);

  const groupedData: Record<
    number,
    {
      [x: string]: number;
      timestamp: number;
    }
  > = {};

  // Prepare the transformed structure
  parsedData.forEach((entry, index) => {
    const date = entry.Year;
    const parsedDate = parseDate(date);

    const gdp = Number(entry.Value);
    const country = sanitize(entry["Country or Area"]);
    // Parse timestamp

    if (!parsedDate) {
      console.log("Could not parse year: ", date, " at index: ", index);
      alert("Can not parse date: " + date);
      return;
    }
    const timestamp = parsedDate.getTime();

    if (!groupedData[timestamp]) {
      groupedData[timestamp] = { timestamp };
    }
    groupedData[timestamp][country] = gdp;
  });

  const returnRecords: { timestamp: number; [stockSymbol: string]: number }[] =
    Object.values(groupedData).sort((a, b) => a.timestamp - b.timestamp);
  console.log("return Records:", returnRecords.length);

  writeDataToFile(JSON.stringify(returnRecords, null, 2));
};

const formatDate = timeFormat("%Y%m%dT%H:%M");

const writeDataToFile = async (dataString: string) => {
  try {
    const filePath = `./src/data/${formatDate(new Date())}_un_gdp_data.json`;
    await Deno.writeTextFile(filePath, dataString);
    console.log("File written successfully:", filePath);
  } catch (e) {
    console.log("Error writing file: ", e);
  }
};

loadGDPData();

//// --------------
//// --------------
//// DATA TYPES
//// --------------
//// --------------

interface GDPData {
  "Country or Area": string;
  Year: string;
  Item: string;
  Value: string;
}

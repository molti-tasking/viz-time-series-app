// Run this file with the following command
// deno run --inspect --allow-read=.  --allow-write  --allow-net util/transformHouseholdData.ts

import { csvParse, timeFormat, timeParse } from "d3";

const parseDate = timeParse("%d/%m/%Y %H:%M");

const loadHouseholdData = async () => {
  // Read the CSV file as a string
  const fileContent = await Deno.readTextFile(
    "util/household_power_consumption.csv"
  );

  const parsedData = csvParse<keyof HouseHoldData>(fileContent);
  console.log("Loading household power data entries: ", parsedData.length);

  // Prepare the transformed structure
  const jsonOutput = parsedData.map((entry) => {
    const date = entry.Date;
    const time = entry.Time;
    const globalActivePower = parseFloat(entry.Global_active_power);

    // Parse timestamp
    const formattedActualDate = parseDate(entry.Date + " " + time.slice(0, 5));
    const formattedDate = parseDate("10/10/2010" + " " + time.slice(0, 5));

    if (!formattedDate || !formattedActualDate) {
      alert("Can not parse date: " + date + " " + time);
      return;
    }

    const timestampMs = formattedDate.getTime();

    // Format month-year key
    const monthYearKey = `${formattedActualDate.getFullYear()} ${formattedActualDate
      .toLocaleString("en-us", { month: "short" })
      .toUpperCase()}`;

    return {
      timestamp: timestampMs,
      [monthYearKey]: globalActivePower,
    };
  });

  console.log("Loaded entries: ", jsonOutput.length);

  // Combine entries into grouped months
  const groupedData: Record<
    number,
    {
      [x: string]: number;
      timestamp: number;
    }
  > = {};
  jsonOutput.forEach((entry, index) => {
    if (!entry) {
      alert("Empty entry: " + entry + " at index " + index);
      return;
    }

    const timestamp = entry.timestamp;
    const [monthYearKey] = Object.keys(entry).filter(
      (key) => key !== "timestamp"
    );
    const value = entry[monthYearKey];

    if (!groupedData[timestamp]) {
      groupedData[timestamp] = { timestamp };
    }
    groupedData[timestamp][monthYearKey] = value;
  });

  if (groupedData) {
    console.log(Object.values(groupedData));
  }

  const returnRecords: { timestamp: number; [stockSymbol: string]: number }[] =
    Object.values(groupedData);

  console.log("returnRecords:", returnRecords);

  writeDataToFile(JSON.stringify(returnRecords));
};

const formatDate = timeFormat("%Y%m%dT%H:%M");

const writeDataToFile = async (dataString: string) => {
  try {
    const filePath = `./src/data/${formatDate(new Date())}_household_data.json`;
    await Deno.writeTextFile(filePath, dataString);
    console.log("File written successfully:", filePath);
  } catch (e) {
    console.log("Error writing file: ", e);
  }
};

loadHouseholdData();

//// --------------
//// --------------
//// DATA TYPES
//// --------------
//// --------------

interface HouseHoldData {
  Date: string;
  Global_active_power: string;
  Global_intensity: string;
  Global_reactive_power: string;
  Sub_metering_1: string;
  Sub_metering_2: string;
  Sub_metering_3: string;
  Time: string;
  Voltage: string;
}

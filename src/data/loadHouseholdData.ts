import { csvParse, timeParse } from "d3";
import csvData from "./household_power_consumption.csv?raw";


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
const parseDate = timeParse("%d/%m/%Y %H:%M");

export const loadHouseholdData = () => {
    const parsedData = csvParse<keyof HouseHoldData>(csvData)

    // Prepare the transformed structure
    const jsonOutput = parsedData.map(entry => {
        const date = entry.Date
        const time = entry.Time
        const globalActivePower = parseFloat(entry.Global_active_power);

        // Parse timestamp
        const formattedActualDate = parseDate(entry.Date + " " + time.slice(0, 5))
        const formattedDate = parseDate("10/10/2010" + " " + time.slice(0, 5))

        if (!formattedDate || !formattedActualDate) {
            alert("Can not parse date: " + date + " " + time)
            return
        }

        const timestampMs = formattedDate.getTime();

        // Format month-year key
        const monthYearKey = `${formattedActualDate.getFullYear()} ${formattedActualDate.toLocaleString('en-us', { month: 'short' }).toUpperCase()}`;

        return {
            timestamp: timestampMs,
            [monthYearKey]: globalActivePower
        };
    });


    // Combine entries into grouped months
    const groupedData: Record<number, {
        [x: string]: number;
        timestamp: number;
    }> = {};
    jsonOutput.forEach((entry, index) => {
        if (!entry) {
            alert("Empty entry: " + entry + " at index " + index)
            return
        }

        const timestamp = entry.timestamp;
        const [monthYearKey] = Object.keys(entry).filter(key => key !== "timestamp");
        const value = entry[monthYearKey];

        if (!groupedData[timestamp]) {
            groupedData[timestamp] = { timestamp };
        }
        groupedData[timestamp][monthYearKey] = value;
    });

    if (groupedData) {
        console.log(Object.values(groupedData))
    }

    return Object.values(groupedData);
}


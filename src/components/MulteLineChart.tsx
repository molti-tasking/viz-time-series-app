import { csvParse } from "d3";
import rawData from "../data_entries.csv?raw";

const data = csvParse(rawData);

export const MulteLineChart = () => {
  return (
    <div>
      Hello World Was geht ab
      <div>
        {data.map((d) => (
          <pre>{JSON.stringify(d)}</pre>
        ))}
      </div>
    </div>
  );
};

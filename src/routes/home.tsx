import { Button } from "@/components/ui/button";
import { useRawDataStore } from "@/store/useRawDataStore";

export default function Home() {
  const values = useRawDataStore((state) => state.values);
  const updateData = useRawDataStore((state) => state.updateData);
  const loadDataset = useRawDataStore((state) => state.loadDataset);
  const generateInitialData = () => {
    updateData("peaks", 12, 40);
  };
  return (
    <div className="container">
      <h1 className="text-2xl my-4">HOME PAGE</h1>
      <p>
        This page overall is under construction. So far you can use the nav to
        view different vizualisations of some time series data.
      </p>
      {/* <p>
        Note: The anu.js dependency has issues at the moment, which is why it
        only runs locally when the repo being cloned. Maybe this will be fixed
        soon.
      </p> */}

      <h2 className="text-xl my-4">Create initial test data</h2>
      <p>
        There are several configurations for testing data that can be used
        through the nav bar. Use the button below to create some initial data.
      </p>

      <div className="flex flex-row gap-4 my-2">
        <Button onClick={generateInitialData} disabled={!!values.length}>
          Create initial data
        </Button>

        <Button onClick={() => loadDataset("GDP")}>Stream UN GDP</Button>
        <Button onClick={() => loadDataset("S&P500")}>Stream S&P 500</Button>
      </div>
    </div>
  );
}

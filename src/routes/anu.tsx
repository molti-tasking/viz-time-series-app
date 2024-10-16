import { BabylonScene } from "./app";

export default function Anu() {
  return (
    <div>
      <div>
        <h1 className="text-xl mt-4">Anu Data Visualization Scene</h1>
        <p className="my-4">
          The following Scene should display multiple time series in parallel to
          get an overall idea of the data in order to properly build up a smart
          2D viz.
        </p>
        <BabylonScene />
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div>
      <nav className="bg-teal-500 py-2">
        <div className="container flex items-center flex-wrap ">
          <div className="text-white mr-6">
            <span className="font-semibold text-xl tracking-tight">
              Time Series Viz
            </span>
          </div>

          <div className="flex flex-row gap-4 mx-8 ">
            <a className="text-sm text-teal-200 hover:text-white" href={`/`}>
              Home
            </a>
            <a className="text-sm text-teal-200 hover:text-white" href={`/anu`}>
              Anu
            </a>
          </div>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
}

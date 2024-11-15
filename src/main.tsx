import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";
import "./index.css";
import AggrLine from "./routes/aggregated-line";
import Anu from "./routes/anu";
import Home from "./routes/home";
import MutliAggregatedLine from "./routes/multi-aggregated-line";
import MultiLine from "./routes/multi-line";
import Root from "./routes/root";

const router = createBrowserRouter([
  {
    path: "/viz-time-series-app",
    element: <Root />,
    errorElement: <ErrorPage />,

    children: [
      { path: "", element: <Home /> },
      { path: "anu", element: <Anu />, errorElement: <ErrorPage /> },
      {
        path: "multi-line",
        element: <MultiLine />,
        errorElement: <ErrorPage />,
      },
      {
        path: "aggregated-line",
        element: <AggrLine />,
        errorElement: <ErrorPage />,
      },
      {
        path: "multi-aggregated-line",
        element: <MutliAggregatedLine />,
        errorElement: <ErrorPage />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

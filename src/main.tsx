import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Anu from "./routes/anu";
import Home from "./routes/home";
import MultiLine from "./routes/multi-line";
import AggrLine from "./routes/aggregated-line";

const router = createBrowserRouter([
  {
    path: "/",
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

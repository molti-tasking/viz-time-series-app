import { Outlet } from "react-router-dom";

export default function Root() {
  const routes = [
    { title: "Home", href: "/" },
    { title: "Anu Multi Line", href: "/anu" },
    { title: "2D Multi Line", href: "/multi-line" },
    { title: "2D Aggregated", href: "/aggregated-line" },
  ];
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-teal-500 py-2">
        <div className="container flex items-center flex-wrap ">
          <div className="text-white mr-6">
            <span className="font-semibold text-xl tracking-tight">
              Time Series Viz
            </span>
          </div>

          <div className="flex flex-row gap-4 mx-8 ">
            {routes.map((r) => (
              <a
                className="text-sm text-teal-200 hover:text-white"
                href={r.href}
              >
                {r.title}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <div className="h-full w-full flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}

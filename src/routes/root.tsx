import { DataSettingsPopover } from "@/components/DataSettingsPopover";
import { Link, Outlet } from "react-router-dom";

export default function Root() {
  const routes = [
    { title: "Home", href: "" },
    { title: "3D", href: "anu" },
    { title: "Multi Line", href: "multi-line" },
    { title: "Aggregation", href: "aggregated-line" },
    { title: "Multi Aggregation", href: "multi-aggregated-line" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-primary text-primary-foreground py-2">
        <div className="container flex items-center flex-wrap ">
          <div className="text-white mr-6">
            <span className="font-semibold text-xl tracking-tight">
              Time VIS
            </span>
          </div>

          <div className="flex flex-row gap-4 mx-8 ">
            {routes.map((r) => (
              <Link
                className="text-sm hover:underline"
                key={r.href}
                to={r.href}
              >
                {r.title}
              </Link>
            ))}
          </div>
          <div className="flex-1"></div>
          <DataSettingsPopover />
        </div>
      </nav>
      <div className="h-full w-full flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}

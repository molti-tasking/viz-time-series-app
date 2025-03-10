import { ExplorationStuff } from "@/components/ExplorationStuff";
import { DataSettingsPopover } from "@/components/forms/DataSettingsPopover";
import { Toaster } from "@/components/ui/toaster";
import { Link, Outlet } from "react-router";

export default function Root() {
  const routes = [
    { title: "Home", href: "" },
    { title: "Streamclusters", href: "streamclusters" },
    { title: "3D", href: "anu" },
    { title: "Multi Line", href: "multi-line" },
    { title: "Aggregation", href: "aggregated-line" },
    { title: "Multi Aggregation", href: "multi-aggregated-line" },
    { title: "Tree Map", href: "multi-aggregated-treemap" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Toaster />
      <nav className="bg-primary text-primary-foreground py-2">
        <div className="container flex items-center flex-wrap justify-between gap-x-6 gap-y-2">
          <div className="text-white flex items-center gap-4">
            <span className="font-semibold text-xl tracking-tight">
              Stream Sight
            </span>
            <ExplorationStuff />
          </div>

          <div className="flex flex-row gap-4">
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
      <div className="w-full flex flex-1" style={{ overflow: "overlay" }}>
        <Outlet />
      </div>
    </div>
  );
}

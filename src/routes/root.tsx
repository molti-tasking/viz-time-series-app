import { SettingsPopover } from "@/components/SettingsPopover";
import { Link, Outlet } from "react-router-dom";

export default function Root() {
  const routes = [
    { title: "Home", href: "/" },
    { title: "Anu Multi Line", href: "/anu" },
    { title: "2D Multi Line", href: "/multi-line" },
    { title: "2D Aggregated", href: "/aggregated-line" },
    { title: "2D Multi Aggregated", href: "/multi-aggregated-line" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-primary text-primary-foreground py-2">
        <div className="container flex items-center flex-wrap ">
          <div className="text-white mr-6">
            <span className="font-semibold text-xl tracking-tight">
              Time Series Viz
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
          <SettingsPopover />
        </div>
      </nav>
      <div className="h-full w-full flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}

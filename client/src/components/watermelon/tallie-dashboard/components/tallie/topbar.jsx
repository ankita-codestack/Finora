
import { useNavigate } from "react-router-dom";
import { LogOutIcon } from "lucide-react";
import { CaretDownIcon } from "./icons";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardTopbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("finoraToken");
    sessionStorage.removeItem("finoraToken");
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-end border-b bg-background px-4 md:h-20 md:px-8">
      <div className="mr-auto md:hidden">
        <SidebarTrigger className="size-8.5 [&_svg]:size-5!" />
      </div>

      <details className="group relative">
        <summary
          aria-label="Account menu"
          className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-1.5 outline-none hover:bg-muted [&::-webkit-details-marker]:hidden"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#e5ebf7] text-sm font-semibold text-[#344563]">
            AS
          </span>

          <CaretDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>

        <div className="absolute right-0 top-full z-[200] mt-2 w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOutIcon className="size-4" />
            Log out
          </button>
        </div>
      </details>
    </header>
  );
}

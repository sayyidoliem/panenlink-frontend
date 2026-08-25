import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
export function AppShell({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <>
      <Sidebar />
      <Topbar />
      <main className={flush ? "app-main flush" : "app-main"}>{children}</main>
    </>
  );
}

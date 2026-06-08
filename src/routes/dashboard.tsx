import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { AppFooter, AppHeader } from "@/components/AppHeader";
import { FactoryLogo } from "@/components/FactoryLogo";
import { MODULES, getModuleLabel } from "@/lib/modules";
import { getUser, hasModule, useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("factory_session")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [{ title: "Dashboard — Factory ERP" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const user = useAuth() ?? getUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-[1fr_360px] gap-6 p-6">
        <div className="flex flex-col">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80"
            alt="Factory ERP workspace"
            className="rounded shadow-sm w-[460px] max-w-full"
          />
          <div className="mt-auto pt-10">
            <h2 className="text-xl font-semibold">Welcome, {user?.displayName ?? "User"}!</h2>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Select a module from the right panel. Only modules permitted for your account are
              available; the rest are disabled.
            </p>
          </div>
        </div>

        <aside className="space-y-2">
          {MODULES.map((m) => {
            const allowed = hasModule(user, m.id);
            const label = getModuleLabel(m.id);
            const Inner = (
              <div
                className={`w-full text-left px-4 py-2.5 border rounded-sm bg-gradient-to-b from-white to-[oklch(0.95_0.005_230)] shadow-sm text-[15px] ${
                  allowed ? "hover:from-[var(--erp-banner)]/30 cursor-pointer" : "opacity-40 cursor-not-allowed"
                }`}
              >
                <span className="underline">{label.charAt(0)}</span>
                {label.slice(1)}
              </div>
            );
            return allowed ? (
  <button
    key={m.id}
    className="block w-full text-left"
    onClick={() => {
  console.log("CLICKED", m.id);

  window.location.href = `/module/${m.id}`;
}}
  >
    {Inner}
  </button>
) : (
  <div key={m.id}>{Inner}</div>
);
          })}
          <div className="border-t pt-3 flex justify-center">
            <FactoryLogo />
          </div>
        </aside>
      </main>
      <AppFooter />
    </div>
  );
}
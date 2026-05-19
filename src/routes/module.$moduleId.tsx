import { createFileRoute, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader, AppFooter } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { getModuleActions, getModuleLabel, MODULES } from "@/lib/modules";
import { getUser, hasModule, type ModuleId } from "@/lib/auth";
import { PurchaseRequisitionDialog } from "@/components/PurchaseRequisitionDialog";
import { PlaceholderDialog } from "@/components/PlaceholderDialog";

export const Route = createFileRoute("/module/$moduleId")({
  beforeLoad: ({ params }) => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("factory_session");
    if (!raw) throw redirect({ to: "/login" });
    const user = JSON.parse(raw);
    const id = params.moduleId as ModuleId;
    const allowed =
      user.modules === "all" ||
      (Array.isArray(user.modules) && user.modules.includes(id));
    if (!MODULES.find((m) => m.id === id) || !allowed) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: ({ params }) => ({
    meta: [{ title: `${getModuleLabel(params.moduleId as ModuleId)} — Factory ERP` }],
  }),
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = useParams({ from: "/module/$moduleId" });
  const id = moduleId as ModuleId;
  const navigate = useNavigate();
  const user = getUser();
  const actions = getModuleActions(id);
  const label = getModuleLabel(id);

  const [prOpen, setPrOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | null>(null);

  if (!hasModule(user, id)) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="bg-[var(--erp-banner)] px-4 py-2 text-sm font-medium border-b border-[oklch(0.7_0.1_90)]">
        Welcome to Factory ERP : &amp; {label} Module [ Branch : MAIN PLANT ]
      </div>
      <main className="flex-1 bg-[oklch(0.96_0.005_230)] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-4 gap-y-6 max-w-[1100px]">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => {
                  if (a.action === "exit") navigate({ to: "/dashboard" });
                  else if (a.action === "pr") setPrOpen(true);
                  else setPlaceholder(a.label);
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 bg-[var(--erp-tile)] border border-border rounded shadow-sm flex items-center justify-center group-hover:border-primary group-hover:shadow-md transition">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs text-center leading-tight max-w-[88px]">{a.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-10">
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Back to Modules
          </Button>
        </div>
      </main>
      <AppFooter note={`** ${label} **`} />

      <PurchaseRequisitionDialog open={prOpen} onOpenChange={setPrOpen} />
      <PlaceholderDialog
        open={!!placeholder}
        onOpenChange={(v) => !v && setPlaceholder(null)}
        title={placeholder ?? ""}
      />
    </div>
  );
}
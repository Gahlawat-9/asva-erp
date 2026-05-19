import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { logout, useAuth } from "@/lib/auth";

export function AppHeader() {
  const user = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-[var(--erp-header)] text-white px-4 py-2 flex items-center justify-between text-sm">
      <div>
        <span className="font-semibold">Factory ERP</span>
        {user && (
          <span className="ml-2">
            : [CHEM] {user.company} : User : {user.displayName}
          </span>
        )}
      </div>
      {user && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="h-7"
        >
          Logout
        </Button>
      )}
    </header>
  );
}

export function AppFooter({ note }: { note?: string }) {
  return (
    <footer className="bg-[var(--erp-footer)] text-xs text-foreground/80 px-4 py-2 flex items-center justify-between">
      <div>
        <span className="text-[var(--erp-danger)] font-semibold">ERP User's</span>
        <span className="ml-3">{note ?? "** Advanced Dash Board **"}</span>
      </div>
      <div>
        Branch: 00 &nbsp;|&nbsp; Year: 2025-2026 &nbsp;
        <a href="/dashboard" className="text-primary underline">Home</a>
      </div>
    </footer>
  );
}
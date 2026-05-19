import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FactoryLogo } from "@/components/FactoryLogo";
import { login } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Factory ERP" },
      { name: "description", content: "Sign in to Factory ERP." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [company] = useState("CHEM");
  const [year] = useState("2026");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(username, password);
    if (!user) {
      toast.error("Invalid credentials. Try admin/admin or rahul/rahul.");
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <form
        onSubmit={submit}
        className="bg-white shadow-2xl w-full max-w-md p-8 space-y-4"
      >
        <div className="flex justify-center mb-4">
          <FactoryLogo />
        </div>
        <Input value={company} readOnly className="h-10" />
        <Input value={year} readOnly className="h-10" />
        <Input
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="h-10"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10"
        />
        <Button type="submit" className="w-full h-11 text-base">
          Log in to Factory ERP
        </Button>
        <div className="flex justify-center gap-3 text-sm text-primary pt-1">
          <button type="button" className="hover:underline font-medium">Forgot password</button>
          <span className="text-muted-foreground">|</span>
          <button type="button" className="hover:underline font-medium">Change Your Password</button>
        </div>
        <div className="border-t pt-3 text-center text-xs text-muted-foreground">
          <span className="underline">Factory © 1992-2026</span> | Helpline No # 9015220220
          <div className="font-semibold mt-1">Build Date: 19/05/2026 16:30</div>
        </div>
        <div className="text-[10px] text-center text-muted-foreground/70">
          Demo: <b>admin</b>/admin (all modules), <b>rahul</b>/rahul (Purchase, Inventory, Quality), <b>finance</b>/finance
        </div>
      </form>
    </div>
  );
}
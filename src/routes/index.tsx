import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const session = localStorage.getItem("factory_session");
    throw redirect({ to: session ? "/dashboard" : "/login" });
  },
  component: Index,
});

function Index() {
  return null;
}

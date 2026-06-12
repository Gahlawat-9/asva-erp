import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Factory ERP</h1>
      <a href="/login">Go to Login</a>
    </div>
  );
}
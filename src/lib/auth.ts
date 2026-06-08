import { useEffect, useState } from "react";

export type ModuleId =
  | "engineering"
  | "purchase"
  | "inventory"
  | "quality"
  | "manufacturing"
  | "sales"
  | "gst"
  | "finance"
  | "hrm"
  | "maintenance"
  | "sysadmin"
  | "mis"
  | "presales";

export interface User {
  _id?: string;
  username: string;
  displayName: string;
  company: string;
  modules: string[];
  role?: string;
}



const KEY = "factory_session";



export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("factory-auth"));
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function hasModule(
  user: User | null,
  id: ModuleId
): boolean {
  if (!user) return false;

  if (
    Array.isArray(user.modules) &&
    user.modules.includes("all")
  ) {
    return true;
  }

  return (
    Array.isArray(user.modules) &&
    user.modules.includes(id)
  );
}

export function useAuth() {
  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    const onChange = () =>
      setUser(getUser());

    onChange();

    window.addEventListener(
      "factory-auth",
      onChange
    );

    window.addEventListener(
      "storage",
      onChange
    );

    return () => {
      window.removeEventListener(
        "factory-auth",
        onChange
      );

      window.removeEventListener(
        "storage",
        onChange
      );
    };
  }, []);

  return user;
}
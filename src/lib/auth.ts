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
  username: string;
  displayName: string;
  company: string;
  modules: ModuleId[] | "all";
}

const USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin",
    user: { username: "admin", displayName: "admin", company: "CHEM ENGINEERS", modules: "all" },
  },
  rahul: {
    password: "rahul",
    user: {
      username: "rahul",
      displayName: "Rahul (Purchase Dept.)",
      company: "CHEM ENGINEERS",
      modules: ["purchase", "inventory"],
    },
  },
  finance: {
    password: "finance",
    user: {
      username: "finance",
      displayName: "Anita (Finance)",
      company: "CHEM ENGINEERS",
      modules: ["finance", "gst", "mis"],
    },
  },
};

const KEY = "factory_session";

export function login(username: string, password: string): User | null {
  const entry = USERS[username.toLowerCase()];
  if (!entry || entry.password !== password) return null;
  localStorage.setItem(KEY, JSON.stringify(entry.user));
  window.dispatchEvent(new Event("factory-auth"));
  return entry.user;
}

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

export function hasModule(user: User | null, id: ModuleId): boolean {
  if (!user) return false;
  if (user.modules === "all") return true;
  return user.modules.includes(id);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getUser());
  useEffect(() => {
    const onChange = () => setUser(getUser());
    window.addEventListener("factory-auth", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("factory-auth", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return user;
}
import {
  BarChart3,
  Boxes,
  Briefcase,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  Download,
  Factory,
  FileBarChart,
  FileCheck2,
  FileText,
  FolderOpen,
  Layers,
  LogOut,
  Megaphone,
  PackageCheck,
  PieChart,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ModuleId } from "./auth";

export interface ModuleDef {
  id: ModuleId;
  label: string;
  accessKey?: string;
}

export const MODULES: ModuleDef[] = [
  { id: "engineering", label: "Engineering & Planning", accessKey: "E" },
  { id: "purchase", label: "Purchase & Procurement", accessKey: "P" },
  { id: "inventory", label: "Inventory Management", accessKey: "I" },
  { id: "quality", label: "Quality Inspection", accessKey: "Q" },
  { id: "manufacturing", label: "Manufacturing", accessKey: "M" },
  { id: "sales", label: "Sales & Marketing", accessKey: "S" },
  { id: "gst", label: "GST Module", accessKey: "G" },
  { id: "finance", label: "Finance", accessKey: "F" },
  { id: "hrm", label: "H.R.M System (Payroll)", accessKey: "H" },
  { id: "maintenance", label: "TMaintenance", accessKey: "T" },
  { id: "sysadmin", label: "ASystem dmin", accessKey: "A" },
  { id: "mis", label: "MIS - Top Mgmt", accessKey: "M" },
  { id: "presales", label: "RPre Sales Management", accessKey: "R" },
];

export interface ModuleAction {
  label: string;
  icon: LucideIcon;
  action: "pr" | "mrr" | "options" | "exit";
}

export function getModuleActions(id: ModuleId): ModuleAction[] {
  switch (id) {
    case "purchase":
      return [
        { label: "General P.O", icon: FileText, action: "pr" },
        { label: "Day Wise Schedule", icon: CalendarDays, action: "options" },
        { label: "Weekly Schedule", icon: CalendarRange, action: "options" },
        { label: "Purchase MIS", icon: BarChart3, action: "options" },
        { label: "Approval System", icon: CheckSquare, action: "options" },
        { label: "Reports", icon: FileBarChart, action: "options" },
        { label: "Stock Ledger", icon: Layers, action: "options" },
        { label: "Stock Summary", icon: PackageCheck, action: "options" },
        { label: "MRR Report", icon: Search, action: "mrr" },
        { label: "Master Files", icon: FolderOpen, action: "options" },
        { label: "Material Receipt", icon: Truck, action: "mrr" },
        { label: "Approved Vendors", icon: FileCheck2, action: "options" },
        { label: "PO Checking", icon: CheckSquare, action: "options" },
        { label: "Import PO", icon: Download, action: "options" },
        { label: "Pending P.O. Chart", icon: PieChart, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "inventory":
      return [
        { label: "Stock Master", icon: Boxes, action: "options" },
        { label: "Stock Ledger", icon: Layers, action: "options" },
        { label: "Stock Summary", icon: PackageCheck, action: "options" },
        { label: "MRR Entry", icon: Truck, action: "mrr" },
        { label: "Issue", icon: FileText, action: "options" },
        { label: "Reports", icon: FileBarChart, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "manufacturing":
      return [
        { label: "Production Plan", icon: Factory, action: "options" },
        { label: "Work Orders", icon: FileText, action: "options" },
        { label: "BOM Master", icon: FolderOpen, action: "options" },
        { label: "Reports", icon: FileBarChart, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "sales":
      return [
        { label: "Sales Order", icon: ShoppingCart, action: "options" },
        { label: "Invoice", icon: Receipt, action: "options" },
        { label: "Customer Master", icon: Users, action: "options" },
        { label: "Sales MIS", icon: BarChart3, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "finance":
      return [
        { label: "Vouchers", icon: Receipt, action: "options" },
        { label: "Ledger", icon: Layers, action: "options" },
        { label: "Trial Balance", icon: FileBarChart, action: "options" },
        { label: "P&L", icon: BarChart3, action: "options" },
        { label: "Balance Sheet", icon: Wallet, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "gst":
      return [
        { label: "GSTR-1", icon: FileText, action: "options" },
        { label: "GSTR-3B", icon: FileText, action: "options" },
        { label: "GST Reports", icon: FileBarChart, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "hrm":
      return [
        { label: "Employee Master", icon: Users, action: "options" },
        { label: "Attendance", icon: CalendarDays, action: "options" },
        { label: "Payroll", icon: Wallet, action: "options" },
        { label: "Leave", icon: FileText, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "quality":
      return [
        { label: "QC Inspection", icon: CheckSquare, action: "options" },
        { label: "Reject Notes", icon: FileText, action: "options" },
        { label: "Reports", icon: FileBarChart, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "engineering":
      return [
        { label: "Drawings", icon: FolderOpen, action: "options" },
        { label: "Planning", icon: CalendarRange, action: "options" },
        { label: "Project MIS", icon: BarChart3, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "maintenance":
      return [
        { label: "Machine Master", icon: Wrench, action: "options" },
        { label: "Breakdown Log", icon: FileText, action: "options" },
        { label: "Preventive", icon: CalendarDays, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "sysadmin":
      return [
        { label: "Users", icon: Users, action: "options" },
        { label: "Rights", icon: Settings, action: "options" },
        { label: "Branches", icon: Briefcase, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "mis":
      return [
        { label: "Dashboard", icon: BarChart3, action: "options" },
        { label: "Top Mgmt Reports", icon: FileBarChart, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
    case "presales":
      return [
        { label: "Leads", icon: Megaphone, action: "options" },
        { label: "Quotations", icon: FileText, action: "options" },
        { label: "Follow-ups", icon: CalendarDays, action: "options" },
        { label: "Exit", icon: LogOut, action: "exit" },
      ];
  }
}

export function getModuleLabel(id: ModuleId): string {
  return MODULES.find((m) => m.id === id)?.label ?? id;
}
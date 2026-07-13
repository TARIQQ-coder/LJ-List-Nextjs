import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  Tags,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/categories", icon: Tags, label: "Categories" },
  { to: "/packages", icon: Boxes, label: "Packages" },
  { to: "/applications", icon: FileText, label: "Applications" },
  { to: "/conversations", icon: MessageSquare, label: "Conversations" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-surface-raised border-r border-surface-border flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <span className="text-white font-semibold text-lg tracking-tight">
          LJ List
        </span>
        <span className="ml-2 text-[10px] text-surface-muted font-medium bg-surface-overlay px-2 py-0.5 rounded">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative cursor-pointer",
                isActive
                  ? "text-white bg-white/10"
                  : "text-surface-muted hover:text-white hover:bg-surface-overlay",
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <div className="text-xs text-surface-muted">LJ List Admin v1.0</div>
      </div>
    </aside>
  );
};

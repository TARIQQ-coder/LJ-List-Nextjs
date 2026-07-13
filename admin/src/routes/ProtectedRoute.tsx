import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/auth";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { Skeleton } from "../components/shared/LoadingSkeleton";

const SidebarSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-5"
        style={{ width: `${60 + Math.random() * 30}%` }}
      />
    ))}
  </div>
);

const TopbarSkeleton = () => (
  <div className="h-16 border-b border-surface-border flex items-center justify-between px-6">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-8 w-8 rounded-full" />
  </div>
);

const PageSkeleton = () => (
  <div className="space-y-4 mt-8">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
    <div className="grid grid-cols-4 gap-4 mt-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-96 rounded-lg mt-4" />
  </div>
);

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-black">
        <div className="w-64 bg-surface-raised p-6">
          <SidebarSkeleton />
        </div>
        <div className="flex-1 p-8">
          <TopbarSkeleton />
          <PageSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

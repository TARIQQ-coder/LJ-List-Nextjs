import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { CardSkeleton } from "../../components/shared/LoadingSkeleton";
import { RangeSelect } from "../../components/shared/RangeSelect";
import { DatePicker } from "../../components/shared/DatePicker";
import { ChartCanvas } from "../../components/shared/ChartCanvas";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  fetchDashboard,
  type DashboardResponse,
} from "../../api/endpoints/dashboard";
import type { DashboardStats } from "../../types";
import { fetchDashboardStats } from "../../api/endpoints/packages";

const statCards = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users },
  { key: "totalProducts" as const, label: "Products", icon: Package },
  { key: "totalApplications" as const, label: "Applications", icon: FileText },
  {
    key: "totalConversations" as const,
    label: "Conversations",
    icon: MessageSquare,
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("week");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch stats (top cards + pending)
  useEffect(() => {
    setLoading(true);
    fetchDashboardStats()
      .then(setStats)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Could not load dashboard data")),
      )
      .finally(() => setLoading(false));
  }, []);

  // Fetch chart data whenever range or dates change
  useEffect(() => {
    setChartLoading(true);
    const params: { range?: string; from?: string; to?: string } = {};

    if (range === "custom") {
      if (fromDate && toDate) {
        params.range = "custom";
        params.from = fromDate;
        params.to = toDate;
      } else {
        // Not both dates selected yet, leave skeleton showing
        setChartLoading(false);
        return;
      }
    } else {
      params.range = range;
    }

    fetchDashboard(params)
      .then(setDashboard)
      .catch(() => setError("Could not load chart data"))
      .finally(() => setChartLoading(false));
  }, [range, fromDate, toDate]);

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-muted">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your platform" />

      {/* Stat cards */}
      {loading ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} variants={item}>
              <CardSkeleton />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {statCards.map(({ key, label, icon: Icon }) => (
            <motion.div
              key={key}
              variants={item}
              className="bg-surface-raised border border-surface-border rounded-xl p-6 hover:border-surface-muted transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-surface-muted">{label}</span>
                <Icon size={18} className="text-surface-muted" />
              </div>
              <div className="text-3xl font-semibold text-white">
                {stats ? stats[key].toLocaleString() : "0"}
              </div>
            </motion.div>
          ))}

          <motion.div
            variants={item}
            className="sm:col-span-2 lg:col-span-4 bg-surface-raised border border-surface-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-surface-muted">
                  Pending Applications
                </span>
                <div className="text-3xl font-semibold text-white mt-1">
                  {stats ? stats.pendingApplications.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-surface-muted mt-2">
                  Applications waiting for review
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <TrendingUp size={22} className="text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chart section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-surface-raised border border-surface-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-white">Activity</h2>
          <div className="flex items-center gap-3">
            {range === "custom" && (
              <div className="flex items-center gap-2">
                <DatePicker value={fromDate} onChange={setFromDate} />
                <span className="text-xs text-surface-muted">to</span>
                <DatePicker value={toDate} onChange={setToDate} />
              </div>
            )}
            <RangeSelect value={range} onChange={setRange} />
          </div>
        </div>

        {chartLoading ? (
          <div className="space-y-3">
            <div className="h-[260px] bg-surface-overlay rounded-lg animate-pulse" />
            <div className="flex justify-center gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-12 bg-surface-overlay rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : dashboard && dashboard.series.length > 0 ? (
          <ChartCanvas series={dashboard.series} />
        ) : (
          <div className="flex items-center justify-center h-[260px] text-surface-muted text-sm">
            {range === "custom" && (!fromDate || !toDate)
              ? "Select both dates to view chart"
              : "No activity data for this period"}
          </div>
        )}
      </motion.div>

      {/* Quick links */}
      {!loading && stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            to="/applications?status=pending"
            className="block bg-surface-raised border border-surface-border rounded-xl p-5 cursor-pointer hover:border-surface-muted transition-colors group"
          >
            <h3 className="text-sm font-medium text-white group-hover:underline">
              Review Applications
            </h3>
            <p className="text-xs text-surface-muted mt-1">
              {stats.pendingApplications} pending
            </p>
          </Link>
          <Link
            to="/conversations"
            className="block bg-surface-raised border border-surface-border rounded-xl p-5 cursor-pointer hover:border-surface-muted transition-colors group"
          >
            <h3 className="text-sm font-medium text-white group-hover:underline">
              View Conversations
            </h3>
            <p className="text-xs text-surface-muted mt-1">
              {stats.totalConversations} open threads
            </p>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

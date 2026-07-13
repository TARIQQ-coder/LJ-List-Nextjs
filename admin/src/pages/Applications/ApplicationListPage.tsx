import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { TableSkeleton } from "../../components/shared/LoadingSkeleton";
import { Pagination } from "../../components/shared/Pagination";
import { EmptyState } from "../../components/shared/EmptyState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { usePagination } from "../../hooks/usePagination";
import { formatCurrency, formatDate } from "../../lib/utils";
import { fetchApplications } from "../../api/endpoints/applications";
import type { Application } from "../../types";

const statusTabs = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
];

export const ApplicationListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const { page, meta, loading, setLoading, setMeta, goNext, goPrev, reset } =
    usePagination();
  const [applications, setApplications] = useState<Application[]>([]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApplications(page, statusFilter);
      setApplications(res.applications);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, setLoading, setMeta]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStatusFilter = (status: string) => {
    reset();
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Review and manage customer applications"
      />

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {statusTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleStatusFilter(key)}
            className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors shrink-0 ${
              statusFilter === key
                ? "bg-white text-black border-white"
                : "border-surface-border text-surface-muted hover:text-white hover:border-surface-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : applications?.length === 0 ? (
        <EmptyState
          title="No applications"
          description="No applications match the current filter."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-raised border border-surface-border rounded-xl overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Customer
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Package
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Amount
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Date
                </th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {applications?.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-overlay/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <span className="text-sm text-white">
                      {app.customer?.display_name || "Unknown"}
                    </span>
                    <span className="block text-xs text-surface-muted">
                      {app.customer?.phone_number}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-surface-muted capitalize">
                    {app.package_type}
                    {app.package_name && ` - ${app.package_name}`}
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-mono">
                    {formatCurrency(app.total_amount)}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-3 text-sm text-surface-muted">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/applications/${app.id}`);
                      }}
                      className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg cursor-pointer"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <Pagination meta={meta} onNext={goNext} onPrev={goPrev} />
    </div>
  );
};

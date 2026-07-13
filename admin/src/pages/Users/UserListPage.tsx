import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { TableSkeleton } from "../../components/shared/LoadingSkeleton";
import { Pagination } from "../../components/shared/Pagination";
import { EmptyState } from "../../components/shared/EmptyState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { usePagination } from "../../hooks/usePagination";
import { formatDate } from "../../lib/utils";
import { fetchUsers } from "../../api/endpoints/users";
import type { User } from "../../types";

export const UserListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "";

  const { page, meta, loading, setLoading, setMeta, goNext, goPrev } =
    usePagination();
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers(page, roleFilter);
      setUsers(res.users);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, setLoading, setMeta]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleFilter = (role: string) => {
    if (role) {
      setSearchParams({ role });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <PageHeader title="Users" description="Manage user accounts" />

      {/* Role filter tabs */}
      <div className="flex gap-2 mb-6">
        {["", "customer", "admin"].map((role) => (
          <button
            key={role}
            onClick={() => handleRoleFilter(role)}
            className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
              roleFilter === role
                ? "bg-white text-black border-white"
                : "border-surface-border text-surface-muted hover:text-white hover:border-surface-muted"
            }`}
          >
            {role || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="No users match the current filter."
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
                  Name
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Phone
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Joined
                </th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-overlay/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3 text-sm text-white">
                    {user.display_name}
                  </td>
                  <td className="px-6 py-3 text-sm text-surface-muted font-mono">
                    {user.phone_number}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={user.role} />
                  </td>
                  <td className="px-6 py-3 text-sm text-surface-muted">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/users/${user.id}`);
                      }}
                      className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg cursor-pointer"
                    >
                      <Pencil size={15} />
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

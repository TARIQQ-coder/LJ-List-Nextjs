import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { TableSkeleton } from "../../components/shared/LoadingSkeleton";
import { EmptyState } from "../../components/shared/EmptyState";
import { Modal } from "../../components/shared/Modal";
import { formatCurrency } from "../../lib/utils";
import {
  fetchAllPackages,
  deletePackage,
  reactivatePackage,
  type Package,
} from "../../api/endpoints/packages";
import { getApiErrorMessage } from "../../lib/apiError";

type PackageType = Package["type"];

const tabs: { key: PackageType; label: string }[] = [
  { key: "fixed", label: "Fixed" },
  { key: "provisions", label: "Provisions" },
  { key: "detergents", label: "Detergents" },
];

const getPackageItemsSummary = (pkg: Package) => {
  if (pkg.type === "fixed") {
    return `${pkg.items.length} items`;
  }

  return pkg.items.trim() ? pkg.items : "—";
};

export const PackageListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("type") as PackageType) || "fixed";
  const newPackagePath = `/packages/new?pkg=${activeTab}`;

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAllPackages()
      .then((all) => {
        if (cancelled) return;
        setPackages(all.filter((p) => p.type === activeTab));
        setError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load packages"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const pkg = packages.find((p) => p.id === deleteId);
    if (!pkg) return;

    setDeleting(true);
    setError("");
    try {
      await deletePackage(pkg.type, deleteId);
      setPackages((prev) =>
        prev.map((item) =>
          item.id === deleteId ? { ...item, active: false } : item,
        ),
      );
      setDeleteId(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to deactivate package"));
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async () => {
    if (!reactivateId) return;
    const pkg = packages.find((p) => p.id === reactivateId);
    if (!pkg) return;

    setReactivating(true);
    setError("");
    try {
      const updated = await reactivatePackage(pkg.type, reactivateId);
      setPackages((prev) =>
        prev.map((item) => (item.id === reactivateId ? updated : item)),
      );
      setReactivateId(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to reactivate package"));
    } finally {
      setReactivating(false);
    }
  };

  const switchTab = (type: PackageType) => {
    setLoading(true);
    setError("");
    setSearchParams({ type });
  };

  const filtered = packages;

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Manage fixed and department bundles"
        action={
          <button
            onClick={() => navigate(newPackagePath)}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Add Package
          </button>
        }
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors capitalize ${
              activeTab === key
                ? "bg-white text-black border-white"
                : "border-surface-border text-surface-muted hover:text-white hover:border-surface-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No packages"
          description={`No ${activeTab} packages found.`}
          action={
            <button
              onClick={() => navigate(newPackagePath)}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Add Package
            </button>
          }
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
                  Items
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Price
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Monthly
                </th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => (
                <tr
                  key={pkg.id}
                  onClick={() => navigate(`/packages/${pkg.id}?type=${pkg.type}`)}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-overlay/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3 text-sm text-white">{pkg.name}</td>
                  <td className="px-6 py-3 text-sm text-surface-muted">
                    {getPackageItemsSummary(pkg)}
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-mono">
                    {formatCurrency(pkg.price)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs ${
                        pkg.active === false
                          ? "border-red-500/30 text-red-300"
                          : "border-emerald-500/30 text-emerald-300"
                      }`}
                    >
                      {pkg.active === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-surface-muted font-mono">
                    {pkg.type === "fixed" ? formatCurrency(pkg.monthly) : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/packages/${pkg.id}?type=${pkg.type}`);
                        }}
                        className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>
                      {pkg.active === false ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReactivateId(pkg.id);
                          }}
                          className="text-surface-muted cursor-pointer hover:text-emerald-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg"
                          title="Reactivate package"
                        >
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(pkg.id);
                          }}
                          className="text-surface-muted cursor-pointer hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg"
                          title="Deactivate package"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Deactivate Package"
        description="This will deactivate the package. Existing applications will not be affected."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        variant="danger"
        loading={deleting}
      />
      <Modal
        open={!!reactivateId}
        onClose={() => setReactivateId(null)}
        title="Reactivate Package"
        description="This will make the package available again."
        confirmLabel="Reactivate"
        onConfirm={handleReactivate}
        loading={reactivating}
      />
    </div>
  );
};

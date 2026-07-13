import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { SelectDropdown } from "../../components/shared/SelectDropdown";
import {
  fetchApplicationById,
  updateApplicationStatus,
} from "../../api/endpoints/applications";
import { getApiErrorMessage } from "../../lib/apiError";
import { APPLICATION_STATUS_OPTIONS } from "../../lib/catalog";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import type { Application } from "../../types";

export const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<Application["status"] | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadApplication = async () => {
      await Promise.resolve();
      if (cancelled) return;

      setError("");
      setLoading(true);

      try {
        const found = await fetchApplicationById(id);
        if (cancelled) return;
        setApplication(found);
        setNewStatus(found.status);
      } catch (error) {
        if (cancelled) return;
        setApplication(null);
        setError(getApiErrorMessage(error, "Failed to load application"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadApplication();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !newStatus || !application || newStatus === application.status)
      return;
    setUpdating(true);
    setError("");
    try {
      await updateApplicationStatus(id, newStatus as Application["status"]);
      setApplication({
        ...application,
        status: newStatus as Application["status"],
      });
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update application"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-surface-overlay rounded animate-pulse" />
        <div className="h-96 bg-surface-raised rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-muted">Application not found</p>
      </div>
    );
  }

  const statusChanged = newStatus !== application.status;

  return (
    <div>
      <PageHeader
        title="Application Detail"
        action={
          <button
            onClick={() => navigate("/applications")}
            className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <div className="min-w-44">
                <SelectDropdown
                  value={newStatus}
                  onChange={(next) =>
                    setNewStatus(next as Application["status"])
                  }
                  options={APPLICATION_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={!statusChanged || updating}
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer text-sm"
              >
                {updating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Update
              </button>
            </div>
          </div>

          <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">Cart Items</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left text-xs text-surface-muted font-medium py-2">
                    Item
                  </th>
                  <th className="text-left text-xs text-surface-muted font-medium py-2">
                    Qty
                  </th>
                  <th className="text-left text-xs text-surface-muted font-medium py-2">
                    Price
                  </th>
                  <th className="text-right text-xs text-surface-muted font-medium py-2">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {application?.cart_items?.map((item) => (
                  <tr
                    key={item.product_id}
                    className="border-b border-surface-border last:border-0"
                  >
                    <td className="py-3 text-sm text-white">{item.name}</td>
                    <td className="py-3 text-sm text-surface-muted">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-sm text-surface-muted font-mono">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 text-sm text-white font-mono text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4 pt-3 border-t border-surface-border">
              <span className="text-sm text-white font-semibold">
                Total: {formatCurrency(application.total_amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">Customer</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-surface-muted">Name</dt>
                <dd className="text-sm text-white">
                  {application.customer?.display_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Phone</dt>
                <dd className="text-sm text-white font-mono">
                  {application.customer?.phone_number}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Institution</dt>
                <dd className="text-sm text-white">
                  {application.institution}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Staff Number</dt>
                <dd className="text-sm text-white font-mono">
                  {application.staff_number}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Ghana Card</dt>
                <dd className="text-sm text-white font-mono">
                  {application.ghana_card_number}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Mandate</dt>
                <dd className="text-sm text-white font-mono">
                  {application.mandate_number}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-surface-muted">Package Type</dt>
                <dd className="text-sm text-white capitalize">
                  {application.package_type}
                </dd>
              </div>
              {application.package_name && (
                <div>
                  <dt className="text-xs text-surface-muted">Package</dt>
                  <dd className="text-sm text-white">
                    {application.package_name}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-surface-muted">Monthly Amount</dt>
                <dd className="text-sm text-white font-mono">
                  {formatCurrency(application.monthly_amount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Status</dt>
                <dd>
                  <StatusBadge status={application.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Submitted</dt>
                <dd className="text-sm text-surface-muted">
                  {formatDateTime(application.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Last Updated</dt>
                <dd className="text-sm text-surface-muted">
                  {formatDateTime(application.updated_at)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

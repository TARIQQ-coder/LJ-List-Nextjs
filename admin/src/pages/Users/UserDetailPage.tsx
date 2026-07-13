import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { FormSkeleton } from "../../components/shared/LoadingSkeleton";
import { Modal } from "../../components/shared/Modal";
import { SelectDropdown } from "../../components/shared/SelectDropdown";
import { fetchUserById, updateUser } from "../../api/endpoints/users";
import { getApiErrorMessage } from "../../lib/apiError";
import { formatDateTime } from "../../lib/utils";
import { USER_ROLE_OPTIONS } from "../../lib/catalog";
import type { User } from "../../types";

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    phone_number: "",
    role: "customer" as User["role"],
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const found = id ? await fetchUserById(id) : null;
        if (cancelled) return;
        setUser(found);
        if (found) {
          setForm({
            display_name: found.display_name,
            phone_number: found.phone_number,
            role: found.role,
          });
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load user"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError("");
    try {
      const updated = await updateUser(id, {
        display_name: form.display_name,
        phone_number: form.phone_number,
        role: form.role,
      });
      setUser(updated.user);
      setEditOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update user"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Details" />
        <FormSkeleton fields={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-muted">User not found</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={user.display_name}
        description={user.phone_number}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/users")}
              className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        }
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h3 className="text-sm font-medium text-white mb-4">Profile</h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-surface-muted">Display Name</dt>
              <dd className="text-sm text-white">{user.display_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-surface-muted">Phone</dt>
              <dd className="text-sm text-white font-mono">
                {user.phone_number}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-surface-muted">Role</dt>
              <dd className="text-sm text-white">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-surface-muted">Joined</dt>
              <dd className="text-sm text-white">
                {formatDateTime(user.created_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h3 className="text-sm font-medium text-white mb-4">Details</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-surface-muted">User ID</dt>
              <dd className="break-all text-sm text-white">{user.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-surface-muted">Updated</dt>
              <dd className="text-sm text-white">
                {formatDateTime(user.updated_at)}
              </dd>
            </div>
          </dl>
        </div>
      </motion.div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit User"
        description="Update the user and save changes back to the admin API."
        panelClassName="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) =>
                setForm((current) => ({ ...current, display_name: e.target.value }))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) =>
                setForm((current) => ({ ...current, phone_number: e.target.value }))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">Role</label>
            <SelectDropdown
              value={form.role}
              onChange={(value) =>
                setForm((current) => ({ ...current, role: value as User["role"] }))
              }
              options={USER_ROLE_OPTIONS}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

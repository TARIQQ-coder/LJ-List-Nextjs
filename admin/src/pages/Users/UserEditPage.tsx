import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { FormSkeleton } from "../../components/shared/LoadingSkeleton";
import { SelectDropdown } from "../../components/shared/SelectDropdown";
import { updateUser } from "../../api/endpoints/users";
import { fetchUsers } from "../../api/endpoints/users";
import { getApiErrorPayload } from "../../lib/apiError";
import { USER_ROLE_OPTIONS } from "../../lib/catalog";
import type { User } from "../../types";

export const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<User["role"]>("customer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    // Fetch the user by loading page 1 and finding them
    // In a real app with a GET /admin/users/:id endpoint, use that directly
    fetchUsers(1)
      .then((res) => {
        const found = res.users.find((u) => u.id === id);
        if (found) {
          setUser(found);
          setDisplayName(found.display_name);
          setPhoneNumber(found.phone_number);
          setRole(found.role);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setMessage("");
    setError("");
    setErrorDetails([]);
    try {
      await updateUser(id, {
        display_name: displayName,
        phone_number: phoneNumber,
        role,
      });
      setMessage("User updated successfully");
      setTimeout(() => navigate("/users"), 1000);
    } catch (error) {
      const apiError = getApiErrorPayload(error, "Failed to update user");
      setError(apiError.message);
      setErrorDetails(apiError.details);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit User" />
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
        title="Edit User"
        action={
          <button
            onClick={() => navigate("/users")}
            className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="max-w-lg bg-surface-raised border border-surface-border rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm text-surface-muted mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-surface-muted mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-surface-muted mb-2">Role</label>
          <SelectDropdown
            value={role}
            onChange={(next) => setRole(next as User["role"])}
            options={USER_ROLE_OPTIONS}
          />
        </div>

        {error && (
          <div className="space-y-2 text-sm">
            <p className="text-red-500">{error}</p>
            {errorDetails.length > 0 ? (
              <ul className="space-y-1 text-red-400">
                {errorDetails.map((detail) => (
                  <li key={detail}>- {detail}</li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
        {message && <p className="text-sm text-surface-muted">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </motion.form>
    </div>
  );
};

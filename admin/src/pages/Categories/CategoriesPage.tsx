import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Plus, Trash2, Tags } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { EmptyState } from "../../components/shared/EmptyState";
import { TableSkeleton } from "../../components/shared/LoadingSkeleton";
import { Modal } from "../../components/shared/Modal";
import {
  createCategory,
  deleteCategory,
  fetchCategoryById,
  fetchCategories,
  updateCategory,
  type Category,
} from "../../api/endpoints/categories";
import { getApiErrorMessage } from "../../lib/apiError";

const emptyForm = {
  id: "",
  name: "",
  sort_order: "",
  active: true,
};

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name),
      ),
    [categories],
  );

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCategories();
      setCategories(res);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    fetchCategoryById(id)
      .then((found) => {
        if (cancelled) return;
        openEdit(found);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Failed to load category"));
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      id: category.id,
      name: category.name,
      sort_order:
        category.sort_order === undefined || category.sort_order === null
          ? ""
          : String(category.sort_order),
      active: category.active,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    if (id) {
      navigate("/categories");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      active: form.active,
      sort_order: form.sort_order.trim()
        ? Number.parseInt(form.sort_order, 10)
        : undefined,
    };

    try {
      if (editing) {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory(payload);
      }
      await loadCategories();
      closeForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setSaving(true);
    setError("");
    try {
      await deleteCategory(deleteId);
      setDeleteId(null);
      await loadCategories();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to delete or deactivate category"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage UUID-backed product categories."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/products")}
              className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={openCreate}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        }
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : sortedCategories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create the first backend category so products can reference its UUID."
          action={
            <button
              onClick={openCreate}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors"
            >
              Add Category
            </button>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-raised border border-surface-border rounded-xl overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Name
                </th>

                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  ID
                </th>
                <th className="w-28" />
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((category) => (
                <tr
                  key={category.id}
                  onClick={() => navigate(`/categories/${category.id}`)}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-overlay/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3 text-sm text-white">
                    {category.name}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        category.active
                          ? "border-green-500/20 text-green-400"
                          : "border-surface-border text-surface-muted"
                      }`}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-surface-muted break-all">
                    {category.id}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(category);
                        }}
                        className="text-surface-muted cursor-pointer hover:text-white transition-colors p-1.5 rounded-lg"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(category.id);
                        }}
                        className="text-surface-muted cursor-pointer hover:text-red-400 transition-colors p-1.5 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit Category" : "Add Category"}
        description="Create or update a category. The returned UUID is what product forms use."
        confirmLabel={editing ? "Save Category" : "Create Category"}
        onConfirm={handleSave}
        loading={saving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({ ...current, name: e.target.value }))
              }
              className="w-full"
              placeholder="Rice, Spaghetti & Grains"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    sort_order: e.target.value,
                  }))
                }
                className="w-full"
                min="0"
                placeholder="1"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    active: !current.active,
                  }))
                }
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  form.active
                    ? "border-white bg-white/10 text-white"
                    : "border-surface-border bg-surface-overlay text-surface-muted"
                }`}
              >
                {form.active ? "Active" : "Inactive"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete or Deactivate Category"
        description="If this category has products attached, it will be set to inactive instead of being deleted. Existing products will keep their category, but inactive categories cannot be selected for new products until they are activated again."
        confirmLabel="Delete or Deactivate"
        onConfirm={handleDelete}
        variant="danger"
        loading={saving}
      />
    </div>
  );
};

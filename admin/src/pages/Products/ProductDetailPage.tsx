import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import {
  TableSkeleton,
  FormSkeleton,
} from "../../components/shared/LoadingSkeleton";
import { Modal } from "../../components/shared/Modal";
import { SelectDropdown } from "../../components/shared/SelectDropdown";
import {
  fetchProductById,
  updateProduct,
  deleteProduct,
} from "../../api/endpoints/products";
import { fetchCategories } from "../../api/endpoints/categories";
import { getApiErrorMessage } from "../../lib/apiError";
import { toCategoryOption } from "../../lib/categoryOptions";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import type { Product } from "../../types";
import type { SelectOption } from "../../components/shared/SelectDropdown";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    price: "",
    old_price: "",
    tag: "",
    unit: "",
    active: true,
  });

  const categoryLabel = useMemo(
    () =>
      categories.find((option) => option.value === product?.category_id)
        ?.label ??
      product?.category ??
      "—",
    [categories, product],
  );
  const productImages = product?.images ?? [];

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          id ? fetchProductById(id) : Promise.resolve(null),
          fetchCategories().catch(() => []),
        ]);

        if (cancelled) return;

        setCategories(categoryRes.map(toCategoryOption));

        setProduct(productRes);
        if (productRes) {
          setForm({
            name: productRes.name,
            category_id: productRes.category_id ?? "",
            price: String(productRes.price ?? ""),
            old_price: String(productRes.old_price ?? ""),
            tag: productRes.tag ?? "",
            unit: productRes.unit ?? "",
            active: productRes.active,
          });
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load product"));
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
      const updated = await updateProduct(id, {
        name: form.name,
        category_id: form.category_id,
        price: Number.parseInt(form.price, 10),
        unit: form.unit,
        active: form.active,
        old_price: form.old_price.trim()
          ? Number.parseInt(form.old_price, 10)
          : undefined,
        tag: form.tag.trim() || undefined,
      });
      setProduct(updated);
      setEditOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update product"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setError("");
    try {
      await deleteProduct(id);
      navigate("/products");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete product"));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Details" />
        <FormSkeleton fields={4} />
        <TableSkeleton rows={3} cols={2} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-muted">Product not found</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={product.name}
        description={categoryLabel}
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
        <div className="rounded-2xl border border-surface-border bg-surface-raised overflow-hidden">
          <div className="aspect-[16/10] bg-black/20">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-surface-muted">
                <div className="text-center">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  No image_url available
                </div>
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.tag ? (
                <span className="rounded-full border border-surface-border px-2.5 py-0.5 text-xs text-white">
                  {product.tag}
                </span>
              ) : null}
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  product.active
                    ? "border-green-500/20 text-green-400"
                    : "border-surface-border text-surface-muted"
                }`}
              >
                {product.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-surface-muted">Price</div>
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(product.price)}
                </div>
              </div>
              <div>
                <div className="text-xs text-surface-muted">Old Price</div>
                <div className="text-lg font-semibold text-white">
                  {product.old_price ? formatCurrency(product.old_price) : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-surface-muted">Category</div>
                <div className="text-sm text-white">{categoryLabel}</div>
              </div>
              <div>
                <div className="text-xs text-surface-muted">Unit</div>
                <div className="text-sm text-white">{product.unit}</div>
              </div>
            </div>

            {productImages.length > 0 && (
              <div>
                <div className="mb-2 text-xs text-surface-muted">Gallery</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {productImages.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square overflow-hidden rounded-lg border border-surface-border bg-surface-overlay"
                    >
                      <img
                        src={image.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
            <h3 className="text-sm font-medium text-white mb-4">
              Product Info
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-surface-muted">Product ID</dt>
                <dd className="break-all text-sm text-white">{product.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Category UUID</dt>
                <dd className="break-all text-sm text-white">
                  {product.category_id || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Created</dt>
                <dd className="text-sm text-white">
                  {productImages[0]?.created_at
                    ? formatDateTime(productImages[0].created_at)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-surface-muted">Images</dt>
                <dd className="text-sm text-white">
                  {productImages.length}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-raised p-6">
            <h3 className="text-sm font-medium text-white mb-4">Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/products/${product.id}/images`)}
                className="rounded-lg border border-surface-border px-4 py-2 text-left text-sm text-white hover:bg-surface-overlay transition-colors"
              >
                Manage images
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="rounded-lg border border-red-500/20 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 size={15} />
                Delete product
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Product"
        description="Update the product fields and save back to the admin API."
        panelClassName="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
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
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Category
            </label>
            <SelectDropdown
              value={form.category_id}
              onChange={(value) =>
                setForm((current) => ({ ...current, category_id: value }))
              }
              options={categories}
              placeholder="Select category"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Price
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((current) => ({ ...current, price: e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Old Price
              </label>
              <input
                type="number"
                value={form.old_price}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    old_price: e.target.value,
                  }))
                }
                className="w-full"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Tag
              </label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) =>
                  setForm((current) => ({ ...current, tag: e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Unit
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) =>
                  setForm((current) => ({ ...current, unit: e.target.value }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, active: !current.active }))
              }
              className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                form.active
                  ? "bg-white"
                  : "bg-surface-overlay border border-surface-border"
              }`}
            >
              <motion.div
                className={`absolute top-0.5 w-5 h-5 rounded-full ${
                  form.active
                    ? "bg-black right-0.5"
                    : "bg-surface-muted left-0.5"
                }`}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </button>
            <span className="text-sm text-surface-muted">
              {form.active ? "Active" : "Inactive"}
            </span>
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

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Product"
        description="This will deactivate the product. Existing applications will not be affected."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

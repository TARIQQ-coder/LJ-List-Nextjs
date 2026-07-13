import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { FormSkeleton } from "../../components/shared/LoadingSkeleton";
import { SelectDropdown } from "../../components/shared/SelectDropdown";
import { Modal } from "../../components/shared/Modal";
import { PackageItemModal } from "../../components/packages/PackageItemModal";
import { PACKAGE_TYPE_OPTIONS } from "../../lib/catalog";
import {
  createPackage,
  updatePackage,
  fetchAllPackages,
  type PackageType,
  type PackageItem,
} from "../../api/endpoints/packages";
import { fetchProducts } from "../../api/endpoints/products";
import { getApiErrorMessage } from "../../lib/apiError";
import { formatCurrency } from "../../lib/utils";
import type { Product } from "../../types";

const emptyFixedItem = (): PackageItem => ({
  product_id: "",
  qty: 1,
  label: "",
  emoji: "",
  image_url: "",
});

const isPackageType = (value: string | null): value is PackageType =>
  value === "fixed" || value === "provisions" || value === "detergents";

export const PackageFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageTypeParam = searchParams.get("pkg") ?? searchParams.get("type");
  const initialType = isPackageType(packageTypeParam) ? packageTypeParam : "fixed";
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [packageId, setPackageId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [monthly, setMonthly] = useState("");
  const [tag, setTag] = useState("");
  const [tagline, setTagline] = useState("");
  const [riceOptions, setRiceOptions] = useState("");
  const [popular, setPopular] = useState(false);
  const [type, setType] = useState<PackageType>(initialType);
  const [items, setItems] = useState<PackageItem[]>([emptyFixedItem()]);
  const [simpleItems, setSimpleItems] = useState("");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [removeItemIndex, setRemoveItemIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [packageRes, productRes] = await Promise.all([
          id ? fetchAllPackages() : Promise.resolve([]),
          fetchProducts(1, undefined, 100).catch(() => ({ products: [] })),
        ]);

        if (cancelled) return;

        setProducts(productRes.products ?? []);

        if (id) {
          const found = packageRes.find((p) => p.id === id);
          if (found) {
            setPackageId(found.id);
            setName(found.name);
            setPrice(String(found.price ?? ""));
            setType(found.type);
            if (found.type === "fixed") {
              setMonthly(String(found.monthly ?? ""));
              setTag(found.tag ?? "");
              setTagline(found.tagline ?? "");
              setRiceOptions(found.rice_options ?? "");
              setPopular(Boolean(found.popular));
              setItems(
                found.items.length > 0
                  ? found.items.map((item) => ({
                      product_id: item.product_id ?? "",
                      qty: item.qty ?? 1,
                      label: item.label ?? "",
                      emoji: item.emoji ?? "",
                      image_url: item.image_url ?? item.product?.image_url ?? "",
                      product: item.product,
                    }))
                  : [emptyFixedItem()],
              );
              setSimpleItems("");
            } else {
              setMonthly("");
              setTag("");
              setTagline("");
              setRiceOptions("");
              setPopular(false);
              setItems([emptyFixedItem()]);
              setSimpleItems(typeof found.items === "string" ? found.items : "");
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const addItem = () => {
    setEditingItemIndex(null);
    setItemModalOpen(true);
  };

  const requestRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setRemoveItemIndex(index);
  };

  const confirmRemoveItem = () => {
    if (removeItemIndex === null || items.length === 1) return;
    const nextItems = items.filter((_, i) => i !== removeItemIndex);
    setItems(nextItems.length > 0 ? nextItems : [emptyFixedItem()]);
    setRemoveItemIndex(null);
    setMessage("");
    setError("");
  };

  const getItemDisplay = (item: PackageItem) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    const productName = product?.name || item.product?.name || "";
    const previewImage = item.image_url || item.product?.image_url || product?.image_url;
    const meta = product
      ? [
          product.category,
          product.unit ? `Unit: ${product.unit}` : "",
          formatCurrency(product.price),
        ]
          .filter(Boolean)
          .join(" · ")
      : item.qty
        ? `Qty: ${item.qty}`
        : "";

    return {
      title: item.label || productName || "Untitled item",
      productName,
      previewImage,
      meta,
    };
  };

  const editItem = (index: number) => {
    setEditingItemIndex(index);
    setItemModalOpen(true);
  };

  const handleSaveItem = (item: PackageItem) => {
    if (editingItemIndex === null) {
      setItems((current) => [...current, item]);
      return;
    }

    setItems((current) =>
      current.map((existing, index) =>
        index === editingItemIndex ? item : existing,
      ),
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!packageId || !name || !price) {
      setError("ID, name and price are required");
      return;
    }

    const isFixed = type === "fixed";
    if (isFixed && !monthly) {
      setError("Monthly price is required for fixed packages");
      return;
    }

    if (!isFixed && !simpleItems.trim()) {
      setError("Package items are required");
      return;
    }

    const payload = isFixed
      ? {
          id: packageId.trim(),
          name,
          price: price.trim(),
          monthly: monthly.trim(),
          popular,
          tag: tag.trim() || undefined,
          tagline: tagline.trim() || undefined,
          rice_options: riceOptions.trim() || undefined,
          items: items
            .map((item) => ({
              product_id: item.product_id?.trim() || undefined,
              qty: item.qty || 1,
              label: item.label.trim(),
              emoji: item.emoji?.trim() || undefined,
              image_url: item.image_url?.trim() || undefined,
            }))
            .filter((item) => item.label),
        }
      : {
          id: packageId.trim(),
          name,
          price: parseInt(price, 10),
          items: simpleItems.trim(),
        };

    setSaving(true);
    try {
      if (isEditing && id) {
        await updatePackage(type, id, payload);
        setMessage("Package updated");
      } else {
        await createPackage(type, payload);
        setMessage("Package created");
      }
      setTimeout(() => navigate("/packages"), 800);
    } catch (error) {
      setError(getApiErrorMessage(error, "Something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEditing ? "Edit Package" : "New Package"} />
        <FormSkeleton fields={4} />
      </div>
    );
  }

  return (
      <div>
        <PageHeader
          title={isEditing ? "Edit Package" : "New Package"}
          action={
            <button
              onClick={() => navigate("/packages")}
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
        className="max-w-2xl space-y-6"
      >
        <div className="bg-surface-raised border border-surface-border rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-surface-muted mb-2">
              ID / Slug
            </label>
            <input
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full"
              required
              disabled={isEditing}
              placeholder="e.g. abusua"
            />
            <p className="mt-2 text-xs text-surface-muted">
              Use a short unique code for this package, like `abusua`.
            </p>
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
              placeholder="e.g. Abusua Asomdwee"
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Type
            </label>
            <SelectDropdown
              value={type}
              onChange={(next) => setType(next as PackageType)}
              options={PACKAGE_TYPE_OPTIONS}
              disabled={isEditing}
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Price (GHC)
            </label>
            <input
              type={type === "fixed" ? "text" : "number"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full"
              required
              min={type === "fixed" ? undefined : "0"}
              placeholder={type === "fixed" ? "GH₵569" : "250"}
            />
          </div>

          {type === "fixed" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-muted mb-2">
                    Monthly (GHC)
                  </label>
                  <input
                    type="text"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                    className="w-full"
                    required
                    placeholder="GH₵190/mo"
                  />
                </div>
                <div>
                  <label className="block text-sm text-surface-muted mb-2">
                    Popular
                  </label>
                  <button
                    type="button"
                    onClick={() => setPopular((current) => !current)}
                    className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                      popular
                        ? "bg-white"
                        : "bg-surface-overlay border border-surface-border"
                    }`}
                  >
                    <motion.div
                      className={`absolute top-1 w-6 h-6 rounded-full ${
                        popular ? "bg-black right-1" : "bg-surface-muted left-1"
                      }`}
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-surface-muted mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full"
                  placeholder="e.g. Starter"
                />
              </div>

              <div>
                <label className="block text-sm text-surface-muted mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full"
                  placeholder="e.g. Perfect for individuals and small families"
                />
              </div>

              <div>
                <label className="block text-sm text-surface-muted mb-2">
                  Rice options
                </label>
                <input
                  type="text"
                  value={riceOptions}
                  onChange={(e) => setRiceOptions(e.target.value)}
                  className="w-full"
                  placeholder="e.g. Ginny Viet · Ginny Gold · Everest Viet"
                />
              </div>
              <p className="text-xs text-surface-muted">
                Fixed packages use a modal item editor with product image
                previews.
              </p>
            </>
          ) : (
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Package Items
              </label>
              <textarea
                value={simpleItems}
                onChange={(e) => setSimpleItems(e.target.value)}
                className="w-full min-h-28"
                placeholder="Describe the package contents"
              />
              <p className="mt-2 text-xs text-surface-muted">
                Provisions and detergents use a simple description string.
              </p>
            </div>
          )}
        </div>

        {type === "fixed" && (
          <div className="bg-surface-raised border border-surface-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {items.map((item, index) => {
                const display = getItemDisplay(item);
                return (
                  <div
                    key={`${item.product_id ?? "manual"}-${index}`}
                    className="rounded-xl border border-surface-border bg-surface-overlay/40 p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {display.title}
                        </h4>
                        <p className="text-xs text-surface-muted">
                          {display.productName || display.meta || "Manual item"}
                        </p>
                      </div>
                      {item.emoji ? (
                        <span className="text-lg leading-none">
                          {item.emoji}
                        </span>
                      ) : null}
                    </div>

                    <div className="aspect-video rounded-lg overflow-hidden border border-surface-border bg-black/20">
                      {display.previewImage ? (
                        <img
                          src={display.previewImage}
                          alt={display.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-surface-muted text-xs">
                          No preview image
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-surface-muted">
                      <div>
                        Qty: <span className="text-white">{item.qty}</span>
                      </div>
                      <div>
                        <span className="text-white">{display.meta || "Item"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editItem(index)}
                        className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-surface-border text-white hover:bg-surface-overlay transition-colors"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => requestRemoveItem(index)}
                        disabled={items.length === 1}
                        className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-surface-border text-surface-muted hover:text-red-400 hover:border-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PackageItemModal
          open={itemModalOpen}
          onClose={() => {
            setItemModalOpen(false);
            setEditingItemIndex(null);
          }}
          onSave={handleSaveItem}
          products={products}
          initialItem={editingItemIndex === null ? null : items[editingItemIndex]}
        />

        <Modal
          open={removeItemIndex !== null}
          onClose={() => setRemoveItemIndex(null)}
          title="Remove Package Item"
          description="This will remove the item from this fixed package when you save the package. If applications already use this package, the save will be rejected."
          confirmLabel="Remove Item"
          onConfirm={confirmRemoveItem}
          variant="danger"
        >
          {removeItemIndex !== null && items[removeItemIndex] ? (
            <div className="rounded-xl border border-surface-border bg-surface-overlay/40 p-4">
              <p className="text-sm font-medium text-white">
                {getItemDisplay(items[removeItemIndex]).title}
              </p>
              <p className="mt-1 text-xs text-surface-muted">
                {getItemDisplay(items[removeItemIndex]).productName ||
                  getItemDisplay(items[removeItemIndex]).meta ||
                  "Manual item"}
              </p>
            </div>
          ) : null}
        </Modal>

        {error && <p className="text-sm text-red-500">{error}</p>}
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
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Package"
          )}
        </button>
      </motion.form>
    </div>
  );
};

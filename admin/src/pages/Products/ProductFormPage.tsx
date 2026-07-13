import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { FormSkeleton } from "../../components/shared/LoadingSkeleton";
import { SelectDropdown } from "../../components/shared/SelectDropdown";
import {
  createProduct,
  updateProduct,
  fetchProducts,
} from "../../api/endpoints/products";
import { fetchCategories } from "../../api/endpoints/categories";
import { getApiErrorMessage } from "../../lib/apiError";
import { toCategoryOption } from "../../lib/categoryOptions";
import type { SelectOption } from "../../components/shared/SelectDropdown";

// Tag presets — admin can pick one or type a custom value
const TAG_PRESETS = ["In Stock", "Seasonal", "Premium", "New", "Limited"];

// ── Toggle component ─────────────────────────────────────────────────────────
const Toggle = ({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) => (
  <div className="flex items-start gap-3">
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative mt-0.5 w-10 h-6 rounded-full flex-shrink-0 transition-colors cursor-pointer ${
        value
          ? "bg-white"
          : "bg-surface-overlay border border-surface-border"
      }`}
    >
      <motion.div
        className={`absolute top-0.5 w-5 h-5 rounded-full ${
          value ? "bg-black right-0.5" : "bg-surface-muted left-0.5"
        }`}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </button>
    <div>
      <p className="text-sm text-white font-medium">{label}</p>
      {description && (
        <p className="text-xs text-surface-muted mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  </div>
);

// ── InfoBox component ────────────────────────────────────────────────────────
const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2.5 bg-surface-overlay border border-surface-border rounded-lg px-4 py-3">
    <Info size={14} className="text-surface-muted flex-shrink-0 mt-0.5" />
    <p className="text-xs text-surface-muted leading-relaxed">{children}</p>
  </div>
);

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading]             = useState(isEditing);
  const [saving, setSaving]               = useState(false);
  const [name, setName]                   = useState("");
  const [category, setCategory]           = useState("");
  const [price, setPrice]                 = useState("");
  const [oldPrice, setOldPrice]           = useState("");
  const [displayTag, setDisplayTag]       = useState("");
  const [customTag, setCustomTag]         = useState("");
  const [unit, setUnit]                   = useState("");
  const [description, setDescription]     = useState("");
  const [instructions, setInstructions]   = useState("");
  const [requiresInquiry, setRequiresInquiry] = useState(false);
  const [orderable, setOrderable]         = useState(true);
  const [active, setActive]               = useState(true);
  const [categories, setCategories]       = useState<SelectOption[]>([]);
  const [message, setMessage]             = useState("");
  const [error, setError]                 = useState("");

  // The final tag to send — custom input takes precedence over preset
  const finalTag = customTag.trim() || displayTag;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetchCategories(),
          id ? fetchProducts(1, undefined, 100) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setCategories(categoryRes.map(toCategoryOption));

        if (productRes && id) {
          const found = productRes.products.find((p) => p.id === id);
          if (found) {
            setName(found.name);
            setCategory(found.category_id ?? found.category ?? "");
            setPrice(found.price > 0 ? String(found.price) : "");
            setOldPrice(String(found.old_price ?? ""));
            // Populate tag fields
            const existingTag = found.display_tag || found.tag || "";
            if (TAG_PRESETS.includes(existingTag)) {
              setDisplayTag(existingTag);
            } else if (existingTag) {
              setCustomTag(existingTag);
            }
            setUnit(found.unit);
            setDescription(found.description ?? "");
            setInstructions(found.instructions ?? "");
            setRequiresInquiry(found.requires_inquiry ?? false);
            setOrderable(found.orderable ?? true);
            setActive(found.active);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // When requires_inquiry is turned on, automatically set tag to "Seasonal"
  // and clear the price — these go hand in hand for seasonal items
  const handleRequiresInquiryChange = (val: boolean) => {
    setRequiresInquiry(val);
    if (val) {
      setOrderable(false);
      if (!displayTag && !customTag) setDisplayTag("Seasonal");
      setPrice(""); // no price for inquiry items
    } else {
      setOrderable(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name || !category || !unit) {
      setError("Name, category and unit are required.");
      return;
    }
    if (!requiresInquiry && !price) {
      setError("Price is required unless the product requires inquiry.");
      return;
    }

    const payload = {
      name,
      category_id:       category,
      // Backend requires price > 0. For inquiry products price is hidden on
      // storefront so we send 1 as a placeholder until the engineer updates
      // the validation to allow price = 0 when requires_inquiry is true.
      price: requiresInquiry
        ? 1
        : price.trim() ? parseInt(price, 10) : 1,
      unit,
      active,
      old_price:         oldPrice.trim() ? parseInt(oldPrice, 10) : undefined,
      display_tag:       finalTag || undefined,
      description:       description.trim() || undefined,
      instructions:      instructions.trim() || undefined,
      requires_inquiry:  requiresInquiry,
      orderable:         orderable,
    };

    setSaving(true);
    try {
      if (isEditing && id) {
        await updateProduct(id, payload);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(payload);
        setMessage("Product created successfully.");
      }
      setTimeout(() => navigate("/products"), 800);
    } catch (err) {
      setError(getApiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEditing ? "Edit Product" : "New Product"} />
        <FormSkeleton fields={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? "Edit Product" : "New Product"}
        action={
          <button
            onClick={() => navigate("/products")}
            className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors flex items-center gap-2"
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
        className="max-w-lg bg-surface-raised border border-surface-border rounded-xl p-6 space-y-6"
      >
        {/* ── Basic Info ── */}
        <div className="space-y-5">
          <p className="text-xs text-surface-muted uppercase tracking-widest font-bold border-b border-surface-border pb-2">
            Basic Information
          </p>

          <div>
            <label className="block text-sm text-surface-muted mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="e.g. Fresh Tomatoes (Basket)"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">Category</label>
            <SelectDropdown
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder="Select category"
            />
            {categories.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/categories")}
                className="mt-3 inline-flex items-center justify-center rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-white hover:bg-surface-overlay transition-colors"
              >
                Add Categories
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full"
              placeholder="e.g. basket, bag, bottle, full box"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-surface-muted mb-2">
              Description <span className="text-surface-muted/50">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none"
              rows={2}
              placeholder="Short description shown on the product page"
            />
          </div>
        </div>

        {/* ── Pricing ── */}
        <div className="space-y-4">
          <p className="text-xs text-surface-muted uppercase tracking-widest font-bold border-b border-surface-border pb-2">
            Pricing
          </p>

          {requiresInquiry ? (
            <InfoBox>
              Price is hidden on the storefront for inquiry-only products.
              Clients will see "Price on Request" and an Enquire button.
            </InfoBox>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-muted mb-2">Price (GHC)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full"
                  min="1"
                  placeholder="e.g. 120"
                  required={!requiresInquiry}
                />
              </div>
              <div>
                <label className="block text-sm text-surface-muted mb-2">
                  Old Price <span className="text-surface-muted/50">(optional)</span>
                </label>
                <input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  className="w-full"
                  min="0"
                  placeholder="Shows strikethrough"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Display Tag ── */}
        <div className="space-y-4">
          <p className="text-xs text-surface-muted uppercase tracking-widest font-bold border-b border-surface-border pb-2">
            Display Tag
          </p>
          <div className="flex flex-wrap gap-2">
            {TAG_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setDisplayTag(t); setCustomTag(""); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  displayTag === t && !customTag
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-surface-muted border-surface-border hover:border-white hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setDisplayTag(""); setCustomTag(displayTag === "" ? "" : customTag || ""); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                customTag || (!displayTag && !customTag)
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-surface-muted border-surface-border hover:border-white hover:text-white"
              }`}
            >
              Custom
            </button>
          </div>
          {(customTag !== undefined && (!displayTag || customTag)) && (
            <input
              type="text"
              value={customTag}
              onChange={(e) => { setCustomTag(e.target.value); setDisplayTag(""); }}
              className="w-full"
              placeholder="e.g. Market Fresh, New Arrival"
            />
          )}
          {finalTag && (
            <p className="text-xs text-surface-muted">
              Tag shown on storefront: <span className="text-white font-semibold">{finalTag}</span>
            </p>
          )}
        </div>

        {/* ── Availability & Ordering ── */}
        <div className="space-y-4">
          <p className="text-xs text-surface-muted uppercase tracking-widest font-bold border-b border-surface-border pb-2">
            Availability & Ordering
          </p>

          <Toggle
            value={requiresInquiry}
            onChange={handleRequiresInquiryChange}
            label="Requires Inquiry Before Ordering"
            description="Price is hidden and Add to Cart is replaced with an Enquire button. Best for seasonal or market-priced items like fresh vegetables where the price changes."
          />

          <Toggle
            value={!orderable}
            onChange={(val) => setOrderable(!val)}
            label="Disable Direct Ordering"
            description="Clients cannot add this product to their cart. They can only enquire via WhatsApp. Use when stock is managed manually."
          />

          <InfoBox>
            For <strong className="text-white">Vegetables</strong> and other seasonal items,
            turn on <em>Requires Inquiry</em>. This hides the price, adds a "Seasonal" tag,
            and shows an Enquire button — clients WhatsApp you to check availability before applying.
          </InfoBox>
        </div>

        {/* ── Storefront Notice ── */}
        <div className="space-y-3">
          <p className="text-xs text-surface-muted uppercase tracking-widest font-bold border-b border-surface-border pb-2">
            Storefront Notice <span className="text-surface-muted/50 normal-case">(optional)</span>
          </p>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full resize-none"
            rows={3}
            placeholder="e.g. Prices and availability depend on market supply and season. Contact us before applying."
          />
          <InfoBox>
            This notice appears as an amber banner on the product page and
            as a small hint on the product card. Leave blank if not needed.
          </InfoBox>
        </div>

        {/* ── Visibility ── */}
        <div className="space-y-3">
          <p className="text-xs text-surface-muted uppercase tracking-widest font-bold border-b border-surface-border pb-2">
            Visibility
          </p>
          <Toggle
            value={active}
            onChange={setActive}
            label={active ? "Live on storefront" : "Hidden from storefront"}
            description="Toggle off to hide this product without deleting it."
          />
        </div>

        {error   && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3">{error}</p>}
        {message && <p className="text-sm text-green-400 bg-green-900/20 border border-green-800/40 rounded-lg px-4 py-3">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-white text-black px-4 py-3 rounded-lg font-bold cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Product"
          )}
        </button>
      </motion.form>
    </div>
  );
};

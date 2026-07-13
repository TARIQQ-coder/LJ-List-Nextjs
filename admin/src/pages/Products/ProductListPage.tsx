import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { TableSkeleton } from "../../components/shared/LoadingSkeleton";
import { Pagination } from "../../components/shared/Pagination";
import { EmptyState } from "../../components/shared/EmptyState";
import { Modal } from "../../components/shared/Modal";
import { usePagination } from "../../hooks/usePagination";
import { formatCurrency } from "../../lib/utils";
import { fetchProducts, deleteProduct } from "../../api/endpoints/products";
import type { Product } from "../../types";

export const ProductListPage = () => {
  const navigate = useNavigate();
  const { page, meta, loading, setLoading, setMeta, goNext, goPrev } =
    usePagination();
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProducts(page);
      setProducts(res.products);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [page, setLoading, setMeta]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <button
            onClick={() => navigate("/products/new")}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Add Product
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to get started."
          action={
            <button
              onClick={() => navigate("/products/new")}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Add Product
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
                <th className="w-16" />
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Category
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Price
                </th>
                <th className="text-left text-xs text-surface-muted font-medium px-6 py-3">
                  Status
                </th>
                <th className="w-28" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-overlay/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-surface-border bg-surface-overlay flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image size={14} className="text-surface-muted" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-white">
                    {product.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-surface-muted">
                    {product.category}
                  </td>
                  <td className="px-6 py-3 text-sm text-white font-mono">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs ${
                        product.active ? "text-green-400" : "text-surface-muted"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}/images`);
                        }}
                        className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg cursor-pointer"
                      >
                        <Image size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}`);
                        }}
                        className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(product.id);
                        }}
                        className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1.5 rounded-lg cursor-pointer hover:text-red-400"
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

      <Pagination meta={meta} onNext={goNext} onPrev={goPrev} />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
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

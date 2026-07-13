import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { Modal } from "../../components/shared/Modal";
import {
  fetchProductImages,
  uploadProductImages,
  deleteProductImage,
} from "../../api/endpoints/products";
import type { ProductImage } from "../../types";

export const ProductImagesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadImages = () => {
    if (!id) return;
    setLoading(true);
    fetchProductImages(id)
      .then((res) => setImages(res.images))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadImages();
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    setUploading(true);
    try {
      const res = await uploadProductImages(id, Array.from(files));
      setImages(res.images);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !deleteId) return;
    setDeleting(true);
    try {
      await deleteProductImage(id, deleteId);
      setImages((prev) => prev.filter((img) => img.id !== deleteId));
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Product Images"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              Upload
            </button>
            <button
              onClick={() => navigate("/products")}
              className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-surface-overlay rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-surface-muted">
          No images yet. Upload some.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group aspect-square bg-surface-overlay rounded-xl overflow-hidden border border-surface-border"
            >
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDeleteId(img.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Image"
        description="This will permanently remove the image."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

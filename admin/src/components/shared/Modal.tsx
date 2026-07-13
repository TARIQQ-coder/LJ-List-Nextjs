import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  variant?: "default" | "danger";
  loading?: boolean;
  panelClassName?: string;
}

const variants = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  },
} as const;

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  variant = "default",
  loading = false,
  panelClassName,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={variants.overlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className={cn(
              "relative bg-surface-raised border border-surface-border rounded-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-6 shadow-2xl",
              panelClassName ?? "max-w-md",
            )}
            variants={variants.modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-surface-muted hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            {title && (
              <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-surface-muted mb-6">{description}</p>
            )}

            {children}

            {onConfirm && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="bg-surface-raised text-white border border-surface-border px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={cn(
                    "bg-white text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    variant === "danger" &&
                      "bg-red-600! text-white hover:bg-red-700",
                  )}
                >
                  {loading ? "Please wait..." : confirmLabel}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

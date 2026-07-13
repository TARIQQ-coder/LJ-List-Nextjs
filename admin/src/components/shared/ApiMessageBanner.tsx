import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useApiBannerStore } from "../../store/apiBanner";
import { cn } from "../../lib/utils";

export const ApiMessageBanner = () => {
  const message = useApiBannerStore((state) => state.current);
  const dismiss = useApiBannerStore((state) => state.dismiss);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      dismiss(message.id);
    }, message.durationMs);

    return () => window.clearTimeout(timeout);
  }, [dismiss, message]);

  const Icon = message?.variant === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-md sm:right-6 sm:top-6">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "pointer-events-auto rounded-lg border bg-surface-raised p-4 shadow-2xl shadow-black/40",
              message.variant === "success"
                ? "border-green-500/30"
                : "border-red-500/30",
            )}
            role={message.variant === "error" ? "alert" : "status"}
          >
            <div className="flex items-start gap-3">
              <Icon
                size={18}
                className={cn(
                  "mt-0.5 shrink-0",
                  message.variant === "success"
                    ? "text-green-400"
                    : "text-red-400",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {message.message}
                </p>
                {message.details.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-surface-muted">
                    {message.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(message.id)}
                className="rounded-lg p-1 text-surface-muted transition-colors hover:bg-surface-overlay hover:text-white"
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

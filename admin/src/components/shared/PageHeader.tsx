import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start justify-between mb-8"
  >
    <div>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {description && (
        <p className="text-sm text-surface-muted mt-1">{description}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </motion.div>
);

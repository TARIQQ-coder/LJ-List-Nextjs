import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Icon size={40} className="text-surface-muted mb-4" />
    <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
    {description && (
      <p className="text-xs text-surface-muted max-w-sm">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

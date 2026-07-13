import { cn, getStatusColor } from "../../lib/utils";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      getStatusColor(status),
      "border-current/20",
    )}
  >
    {status}
  </span>
);

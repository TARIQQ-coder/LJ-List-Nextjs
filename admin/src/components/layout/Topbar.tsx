import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { Modal } from "../shared/Modal";

export const Topbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <>
      <header className="h-16 border-b border-surface-border flex items-center justify-between px-6 shrink-0">
        <div>
          <span className="text-sm text-surface-muted">Welcome back</span>
          <span className="text-sm text-white font-medium ml-2">
            {user?.display_name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-raised rounded-full border border-surface-border">
            <User size={14} className="text-surface-muted" />
            <span className="text-xs text-surface-muted capitalize">
              {user?.role}
            </span>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-2 rounded-lg cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        onConfirm={handleLogout}
        variant="danger"
      />
    </>
  );
};

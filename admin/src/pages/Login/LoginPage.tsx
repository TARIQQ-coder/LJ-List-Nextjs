import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, KeyRound, RotateCw, Loader } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { adminLogin, resendOtp, verifyOtp } from "../../api/endpoints/auth";
import { getApiErrorPayload } from "../../lib/apiError";
import type { User } from "../../types";

type Step = "login" | "otp";

export const LoginPage = () => {
  const { isAuthenticated, isLoading, user, setAuth, fetchProfile } =
    useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showResend, setShowResend] = useState(false);

  const authenticateAndRedirect = async (response?: unknown) => {
    const loginResponse = response as
      | { data?: { user?: User }; user?: User }
      | undefined;
    const authenticatedUser =
      loginResponse?.data?.user ?? loginResponse?.user ?? null;

    if (authenticatedUser) {
      setAuth(authenticatedUser);
    } else {
      await fetchProfile();
    }

    if (useAuthStore.getState().user?.role !== "admin") {
      setAuth(null);
      throw new Error("Admin access is required");
    }

    navigate("/", { replace: true });
  };

  if (!isLoading && isAuthenticated && user?.role === "admin") {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setError("");
    setErrorDetails([]);
    setResendMessage("");
    setShowResend(false);

    if (!phoneNumber.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await adminLogin(phoneNumber, password);
      await authenticateAndRedirect(response);
    } catch (err: any) {
      const data = err.response?.data;
      const apiError = getApiErrorPayload(err, "Invalid credentials");
      setError(apiError.message);
      setErrorDetails(apiError.details);

      // Account not activated, switch to OTP step
      if (
        data?.code === "FORBIDDEN" &&
        data?.errors?.auth?.[0]?.includes("activation OTP")
      ) {
        setStep("otp");
        setShowResend(true);
      }

      // Already have a resend_code available
      if (data?.resend_code) {
        setShowResend(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setErrorDetails([]);

    if (!otp.trim() || otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(phoneNumber, otp);
      const response = await adminLogin(phoneNumber, password);
      await authenticateAndRedirect(response);
    } catch (err: any) {
      const apiError = getApiErrorPayload(err, "Invalid or expired OTP");
      setError(apiError.message);
      setErrorDetails(apiError.details);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResendMessage("");
    setError("");
    setErrorDetails([]);

    if (!phoneNumber.trim()) {
      setError("Enter your phone number first");
      return;
    }

    setResending(true);
    try {
      await resendOtp(phoneNumber);
      setResendMessage("A new code has been sent");
    } catch (err: any) {
      const apiError = getApiErrorPayload(err, "Could not resend code");
      setError(apiError.message);
      setErrorDetails(apiError.details);
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setOtp("");
    setError("");
    setResendMessage("");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              LJ List
            </h1>
            <p className="text-sm text-surface-muted mt-1">Admin Panel</p>
          </motion.div>
        </div>

        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Phone number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+233240000000"
                  className="w-full pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 text-sm text-red-500"
              >
                <p>{error}</p>
                {errorDetails.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-red-400">
                    {errorDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleLogin}
              className="bg-white text-black px-4 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2 py-3"
            >
              {submitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {showResend && (
              <button
                type="button"
                disabled={resending}
                onClick={handleResendOtp}
                className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full text-sm flex items-center justify-center gap-2 py-2"
              >
                {resending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RotateCw size={14} />
                )}
                Resend activation code
              </button>
            )}

            {resendMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-400 text-center"
              >
                {resendMessage}
              </motion.p>
            )}
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm text-surface-muted mb-2">
                Verification code
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted">
                  <KeyRound size={16} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full pl-10 text-center tracking-[0.5em] text-lg"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}

            <button
              type="button"
              disabled={submitting || otp.length !== 6}
              onClick={handleVerifyOtp}
              className="bg-white text-black px-4 rounded-lg font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2 py-3"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </button>

            <button
              type="button"
              disabled={resending}
              onClick={handleResendOtp}
              className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full text-sm flex items-center justify-center gap-2 py-1"
            >
              {resending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RotateCw size={14} />
              )}
              Resend code
            </button>

            {resendMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-400 text-center"
              >
                {resendMessage}
              </motion.p>
            )}

            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-surface-muted cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full text-sm py-1"
            >
              Back to sign in
            </button>
          </motion.div>
        )}

        <p className="text-center text-xs text-surface-muted mt-8">
          LJ List Admin &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};

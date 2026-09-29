import { errorMessage } from "@/lib/error-message";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase recovery link sets a session via hash params; listen for it.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. Please sign in again.");
      await supabase.auth.signOut();
      navigate({ to: "/church-admin-secure" });
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not update password"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-surface-alt px-4 py-10">
      <div className="w-full max-w-sm glass-card p-7 sm:p-8">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy text-white">
            <Lock size={18} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy mt-4">Set New Password</h1>
          <p className="text-xs text-navy-muted mt-1">
            {ready ? "Choose a strong password" : "Validating reset link…"}
          </p>
        </div>
        {ready && (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="New password (min 8)"
              className="w-full rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            />
            <input
              name="confirm"
              type="password"
              required
              minLength={8}
              placeholder="Confirm password"
              className="w-full rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            />
            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
        <Link
          to="/church-admin-secure"
          className="block mt-4 text-center text-xs text-navy-muted hover:text-navy"
        >
          ← Back to admin sign in
        </Link>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function GuestRoute() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;

      if (mounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error("Unable to check customer session:", error);
        }

        if (!authEventReceived) {
          setSession(data?.session ?? null);
        }

        setLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;

        console.error("Customer session check failed:", error);
        setSession(null);
        setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center bg-[#FAF8F2]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#285C3A]/20 border-t-[#285C3A]" />
          <p className="text-sm text-[#285C3A]">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return <Navigate to="/my-account" replace />;
  }

  return <Outlet />;
}

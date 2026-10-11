import { useEffect, useState } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { LoaderCircle, ShieldAlert, Leaf } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminRoute() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const checkAccess = async (user) => {
      const currentRequest = ++requestId;

      if (!user) {
        if (active) setStatus("signed-out");
        return;
      }

      if (active) setStatus("loading");

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!active || currentRequest !== requestId) return;

        setStatus(data?.role === "admin" ? "allowed" : "unauthorized");
      } catch (error) {
        console.error("Admin authorization check failed:", error);

        if (active && currentRequest === requestId) {
          setStatus("error");
        }
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        setStatus("error");
        return;
      }

      void checkAccess(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer the role query so it does not run inside the auth callback.
      Promise.resolve().then(() => {
        if (active) void checkAccess(session?.user ?? null);
      });
    });

    return () => {
      active = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7EF] px-4">
        <div className="text-center">
          <LoaderCircle
            size={34}
            className="mx-auto animate-spin text-[#285b3b]"
          />
          <p className="mt-4 text-sm font-medium text-[#586354]">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "signed-out") {
    return <Navigate to="/admin/login" replace />;
  }

  if (status === "unauthorized" || status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7EF] px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-[#e8e7dc] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f1df] text-[#9b7b36]">
            <ShieldAlert size={27} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#244b32]">
            {status === "error"
              ? "Access could not be verified"
              : "Administrator access required"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#858a7e]">
            {status === "error"
              ? "We couldn't verify your permissions. Check your Supabase configuration and user_roles policies, then try again."
              : "This account is not authorized to access the admin panel. Contact the store administrator if you believe this is a mistake."}
          </p>

          <Link
            to="/admin/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#285b3b] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e462d]"
          >
            Return to admin login
          </Link>

          <Link
            to="/"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#586354] hover:text-[#285b3b]"
          >
            <Leaf size={16} />
            Back to store
          </Link>
        </section>
      </main>
    );
  }

  return <Outlet />;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { ReactNode } from "react";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("alpacash_demo_session")?.value;

  if (demoRole) {
    return <>{children}</>;
  }

  if (!getSupabaseEnv().isConfigured) {
    redirect("/auth/login?error=supabase-config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("estado")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/complete-profile");
  }

  if (profile.estado === "pendiente" || profile.estado === "suspendido" || profile.estado === "rechazado") {
    redirect(`/auth/login?error=cuenta-${profile.estado}`);
  }

  return <>{children}</>;
}

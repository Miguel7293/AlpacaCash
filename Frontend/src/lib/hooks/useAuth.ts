"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Role, Estado } from "@/lib/supabase/types";
import { getSupabaseEnv } from "@/lib/supabase/env";

type AuthState = {
  user: User | null;
  role: Role | null;
  estado: Estado | null;
  nombre: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Comprobar cookie de bypass demo en el cliente
    if (typeof window !== "undefined") {
      const match = document.cookie.split("; ").find((row) => row.startsWith("alpacash_demo_session="));
      if (match) {
        const val = match.split("=")[1] as Role;
        setUser({
          id: "demo-uuid-1234-5678",
          email: `${val}@alpacash.pe`,
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as any);
        setRole(val);
        setEstado("activo");
        setNombre(`Demo ${val.charAt(0).toUpperCase() + val.slice(1)}`);
        setLoading(false);
        return;
      }
    }

    if (!getSupabaseEnv().isConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function loadProfile(currentUser: User | null) {
      if (!currentUser) {
        if (!cancelled) {
          setRole(null);
          setEstado(null);
          setNombre(null);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("rol, estado, nombre")
        .eq("id", currentUser.id)
        .single();

      if (cancelled) return;

      if (profile) {
        setRole(profile.rol as Role);
        setEstado(profile.estado as Estado);
        setNombre(profile.nombre as string);
      } else {
        setRole(null);
        setEstado(null);
        setNombre(null);
      }
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      setUser(data.user);
      await loadProfile(data.user);
      if (!cancelled) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      if (cancelled) return;
      setUser(nextUser);
      await loadProfile(nextUser);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      document.cookie = "alpacash_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/auth/login";
    }
    if (getSupabaseEnv().isConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
  }, []);

  return { user, role, estado, nombre, loading, signOut };
}

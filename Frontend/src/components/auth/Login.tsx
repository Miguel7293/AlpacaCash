"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, Lock, Eye, EyeOff, Fingerprint } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_TO_ROUTE } from "@/lib/supabase/types";
import type { Role } from "@/lib/supabase/types";
import { getSupabaseEnv } from "@/lib/supabase/env";

const VALID_ROLES: Role[] = ["productor", "empresa", "admin", "financiera"];

export function Login({ onBack, onRegister }: { onBack?: () => void; onRegister?: () => void }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const env = getSupabaseEnv();
  const configError = searchParams.get("error") === "supabase-config" || !env.isConfigured;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!env.isConfigured) {
      setError("Falta configurar Supabase en Vercel o en Frontend/.env.local.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Sesión iniciada pero no se pudo identificar al usuario.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("rol, estado")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        setError("Tu cuenta aún no tiene perfil asignado. Contactá al equipo de AlpaCash.");
        return;
      }

      if (profile.estado === "suspendido" || profile.estado === "rechazado") {
        await supabase.auth.signOut();
        setError(`Tu cuenta está ${profile.estado}. Contactá al equipo para reactivarla.`);
        return;
      }

      const role = profile.rol as Role;
      if (!VALID_ROLES.includes(role)) {
        setError("El rol de tu cuenta no es válido. Contactá al equipo.");
        return;
      }

      router.push(ROLE_TO_ROUTE[role]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      onBack={onBack}
      eyebrow="Confianza · Trazabilidad"
      quote="Bienvenido de vuelta a tu red de confianza comercial alpaquera."
      image="https://images.unsplash.com/photo-1568805711729-f0cde40b5b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
    >
      <div>
        <h1 className="text-3xl tracking-tight text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>Ingresa a AlpaCash</h1>
        <p className="mt-2 text-sm text-[var(--teal-deep)]/70">
          Productores, compradores y aliados con una sola cuenta segura.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="text-[var(--teal-deep)]">Correo o DNI</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.pe"
                className="pl-9 h-11 bg-white border-[var(--border)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pass" className="text-[var(--teal-deep)]">Contraseña</Label>
              <button type="button" className="text-xs text-[var(--terracotta)] hover:underline">¿Olvidaste?</button>
            </div>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                id="pass"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="pl-9 pr-10 h-11 bg-white border-[var(--border)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--terracotta)] bg-[var(--pink)]/30 rounded-xl px-4 py-3">{error}</p>
          )}

          {configError && !error && (
            <p className="text-sm text-[var(--terracotta)] bg-[var(--pink)]/30 rounded-xl px-4 py-3">
              Supabase todavía no está configurado. En Vercel cargá <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          )}

          <label className="flex items-center gap-2 text-sm text-[var(--teal-deep)]/80">
            <input type="checkbox" className="rounded border-[var(--border)]" /> Mantener sesión iniciada
          </label>

          <Button
            type="submit"
            disabled={loading || !env.isConfigured}
            className="w-full h-12 rounded-full bg-[var(--teal-deep)] hover:bg-[var(--teal-700)] text-[var(--ivory)] disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>

          <div className="relative my-2">
            <div className="h-px bg-[var(--border)]" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-[var(--ivory)] px-3 text-xs text-[var(--muted-foreground)]">o continúa con</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-full border-[var(--border)] bg-white text-[var(--teal-deep)]">
              <Fingerprint className="w-4 h-4 mr-2" /> Identificación
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-full border-[var(--border)] bg-white text-[var(--teal-deep)]">
              <Mail className="w-4 h-4 mr-2" /> Google
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--teal-deep)]/80">
          ¿Aún no tienes cuenta?{" "}
          <button onClick={onRegister} className="text-[var(--terracotta)] hover:underline" style={{ fontWeight: 500 }}>
            Crear cuenta
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

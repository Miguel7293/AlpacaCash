"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_TO_ROUTE } from "@/lib/supabase/types";
import type { Role } from "@/lib/supabase/types";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getAuthCallbackUrl } from "@/lib/supabase/redirect";
import { isValidEmail } from "@/lib/forms/validation";

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
  const authErrorCode = searchParams.get("error");
  const registered = searchParams.get("registered") === "1";
  const configError = authErrorCode === "supabase-config" || !env.isConfigured;

  const authMessage = registered
    ? "Cuenta creada. Revisá tu correo para verificarla y esperá la activación del equipo antes de ingresar."
    : authErrorCode === "cuenta-pendiente"
      ? "Tu cuenta existe pero todavía está pendiente de activación."
      : authErrorCode === "cuenta-suspendido"
        ? "Tu cuenta está suspendida. Contactá al equipo de AlpaCash."
        : authErrorCode === "cuenta-rechazado"
          ? "Tu cuenta fue rechazada. Contactá al equipo de AlpaCash."
          : authErrorCode === "callback_failed"
            ? "Falló la autenticación con Google. Intentá de nuevo."
            : authErrorCode === "missing_code"
              ? "Faltó el código de autenticación al volver desde Google."
              : authErrorCode === "no_user"
                ? "No pudimos recuperar tu usuario luego del login."
                : authErrorCode === "no-profile"
                  ? "Tu cuenta necesita completar perfil antes de ingresar."
                  : null;

  async function handleGoogle() {
    setError(null);
    if (!env.isConfigured) {
      setError("Falta configurar Supabase en Vercel o en Frontend/.env.local.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = getAuthCallbackUrl();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          ...(redirectTo ? { redirectTo } : {}),
        },
      });
      if (oauthError) {
        setError(`Google: ${oauthError.message}`);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? `Error: ${err.message}` : "Error inesperado con Google.");
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError(null);

    if (!env.isConfigured) {
      setError("Falta configurar Supabase en Vercel o en Frontend/.env.local.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Ingresá tu correo para enviarte el enlace de recuperación.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = getAuthCallbackUrl();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        ...(redirectTo ? { redirectTo } : {}),
      });

      if (resetError) {
        setError(`No se pudo enviar la recuperación: ${resetError.message}`);
        return;
      }

      setError("Te enviamos un enlace de recuperación a tu correo.");
    } finally {
      setLoading(false);
    }
  }

  const DEMO_MAP: Record<string, { role: Role; email: string; pass: string }> = {
    admin: { role: "admin", email: "admin@alpacash.pe", pass: "AlpacashAdmin2026!" },
    productor: { role: "productor", email: "productor@alpacash.pe", pass: "AlpacashProductor2026!" },
    comprador: { role: "empresa", email: "comprador@alpacash.pe", pass: "AlpacashComprador2026!" },
    empresa: { role: "empresa", email: "comprador@alpacash.pe", pass: "AlpacashComprador2026!" },
    financiera: { role: "financiera", email: "financiera@alpacash.pe", pass: "AlpacashFinanciera2026!" },
  };

  const handleDemoLogin = (role: Role) => {
    setError(null);
    setLoading(true);
    try {
      // Escribir cookie de bypass de demo
      document.cookie = `alpacash_demo_session=${role}; path=/; max-age=86400; SameSite=Lax`;
      router.push(ROLE_TO_ROUTE[role]);
    } catch (err) {
      setError("Error al iniciar modo demo.");
      setLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const inputLower = email.trim().toLowerCase();
    const passLower = password.trim().toLowerCase();

    // Si el usuario usa los atajos rápidos de demo (por ejemplo admin / admin)
    if (DEMO_MAP[inputLower] && (passLower === inputLower || passLower === "admin" || passLower === "alpacash")) {
      handleDemoLogin(DEMO_MAP[inputLower].role);
      return;
    }

    if (!env.isConfigured) {
      // Si no está configurado Supabase pero es una cuenta demo, la permitimos de todos modos en bypass local
      if (DEMO_MAP[inputLower]) {
        handleDemoLogin(DEMO_MAP[inputLower].role);
        return;
      }
      setError("Falta configurar Supabase en Vercel o en Frontend/.env.local.");
      return;
    }

    setLoading(true);
    try {
      // Mapear correo demo si coincide
      let targetEmail = email;
      let targetPassword = password;
      if (DEMO_MAP[inputLower]) {
        targetEmail = DEMO_MAP[inputLower].email;
        targetPassword = DEMO_MAP[inputLower].pass;
      }

      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: targetEmail, 
        password: targetPassword 
      });

      if (authError) {
        // Fallback: Si el inicio de sesión real en Supabase con credenciales de demo falla, activamos el bypass local.
        if (DEMO_MAP[inputLower]) {
          handleDemoLogin(DEMO_MAP[inputLower].role);
          return;
        }
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

      if (profile.estado === "pendiente") {
        await supabase.auth.signOut();
        setError("Tu cuenta todavía está pendiente de activación. Revisá tu correo y esperá la validación del equipo.");
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
            <Label htmlFor="email" className="text-[var(--teal-deep)]">Correo</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                id="email"
                type="text"
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
              <button type="button" onClick={handlePasswordReset} className="text-xs text-[var(--terracotta)] hover:underline">¿Olvidaste?</button>
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

          {!error && authMessage && (
            <p className="text-sm text-[var(--teal-deep)] bg-[var(--mint)]/30 rounded-xl px-4 py-3">
              {authMessage}
            </p>
          )}

          {configError && !error && (
            <p className="text-sm text-[var(--teal-deep)] bg-[var(--gold)]/20 rounded-xl px-4 py-3">
              * Nota: Supabase no está configurado aún. Podés usar los accesos de demostración rápidos abajo.
            </p>
          )}


          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[var(--teal-deep)] hover:bg-[var(--teal-700)] text-[var(--ivory)] disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>

          <div className="relative my-2">
            <div className="h-px bg-[var(--border)]" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-[var(--ivory)] px-3 text-xs text-[var(--muted-foreground)]">o continúa con</span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading || !env.isConfigured}
            className="w-full h-11 rounded-full border-[var(--border)] bg-white text-[var(--teal-deep)] disabled:opacity-60"
          >
            <Mail className="w-4 h-4 mr-2" /> {loading ? "Conectando…" : "Continuar con Google"}
          </Button>

          <div className="relative my-4 pt-2">
            <div className="h-px bg-[var(--border)]" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-1 bg-[var(--ivory)] px-3 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={{ fontWeight: 600 }}>Entorno de Demostración</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: "Administrador (Demo)", role: "admin" },
              { label: "Productor (Demo)", role: "productor" },
              { label: "Comprador (Demo)", role: "empresa" },
              { label: "Financiera (Demo)", role: "financiera" }
            ].map(demo => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleDemoLogin(demo.role as Role)}
                className="py-2.5 px-3 rounded-xl border-2 border-[var(--ink)] bg-white text-xs text-[var(--teal-deep)] hover:bg-[var(--ivory-2)] transition-colors text-center brutalist-shadow-sm"
                style={{ fontWeight: 600 }}
              >
                {demo.label}
              </button>
            ))}
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

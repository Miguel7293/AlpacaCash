"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, Lock, User, MapPin, Building2, Sprout, Factory, LayoutDashboard, Landmark, ArrowRight, Check } from "lucide-react";
import type { RoleId } from "./RoleSelector";
import { createClient } from "@/lib/supabase/client";
import { ROLE_ID_TO_ROLE, ROLE_TO_ROUTE, type Role } from "@/lib/supabase/types";
import { getSupabaseEnv } from "@/lib/supabase/env";

const roleOptions: { id: RoleId; icon: typeof Sprout; label: string }[] = [
  { id: "producer", icon: Sprout, label: "Productor" },
  { id: "buyer", icon: Factory, label: "Comprador" },
  { id: "admin", icon: LayoutDashboard, label: "Admin" },
  { id: "financial", icon: Landmark, label: "Financiero" },
];

export function Register({
  initialRole,
  onBack,
  onLogin,
}: {
  initialRole?: RoleId;
  onBack?: () => void;
  onLogin?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RoleId>(initialRole || "producer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const env = getSupabaseEnv();
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dni: "",
    community: "",
    region: "",
    province: "",
    razonSocial: "",
    ruc: "",
    sector: "",
    address: "",
  });

  const eyebrow =
    role === "producer" ? "Productor alpaquero" :
    role === "buyer" ? "Empresa textil" :
    role === "financial" ? "Aliado financiero" : "Administrador";

  async function handleFinalSubmit() {
    setError(null);

    if (!env.isConfigured) {
      setError("Falta configurar Supabase en Vercel o en Frontend/.env.local.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const mappedRole = ROLE_ID_TO_ROLE[role];
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: mappedRole,
            full_name: fullName,
          },
        },
      });
      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Cuenta creada pero el registro quedó incompleto. Confirmá tu correo y volvé a iniciar sesión.");
        return;
      }

      // The handle_new_user trigger already created public.profiles.
      // Now insert role-specific row with wizard data.
      const detailError = await insertRoleDetail(supabase, userId, mappedRole, fullName);
      if (detailError) {
        setError(`Cuenta creada pero faltó guardar tu perfil: ${detailError}`);
        return;
      }

      router.push(ROLE_TO_ROUTE[mappedRole]);
    } finally {
      setLoading(false);
    }
  }

  async function insertRoleDetail(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    rol: Role,
    fullName: string,
  ): Promise<string | null> {
    if (rol === "productor") {
      const { error: e } = await supabase.from("productores").insert({
        profile_id: userId,
        codigo_productor: `AC-${Date.now().toString(36).toUpperCase()}`,
        dni_ruc: formData.dni || null,
        nombre_asociacion: formData.community || null,
        comunidad: formData.community || null,
        provincia: formData.province || null,
        region: formData.region || "Puno",
      });
      return e?.message ?? null;
    }
    if (rol === "empresa") {
      const { error: e } = await supabase.from("empresas").insert({
        profile_id: userId,
        ruc: formData.ruc || null,
        razon_social: formData.razonSocial || fullName,
        rubro: formData.sector || null,
        direccion: formData.address || null,
      });
      return e?.message ?? null;
    }
    if (rol === "financiera") {
      const { error: e } = await supabase.from("entidades_financieras").insert({
        profile_id: userId,
        razon_social: formData.razonSocial || fullName,
        ruc: formData.ruc || null,
      });
      return e?.message ?? null;
    }
    // admin: no extra table to insert
    return null;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  }

  return (
    <AuthShell
      onBack={onBack}
      eyebrow={eyebrow}
      quote="Cada cuenta verificada fortalece la red de confianza."
      image="https://images.unsplash.com/photo-1735498149705-48d1c7049c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
    >
      <div>
        <h1 className="text-3xl tracking-tight text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-[var(--teal-deep)]/70">
          Te tomará menos de 2 minutos. Podrás completar tu perfil después.
        </p>

        <div className="mt-6 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    done ? "bg-emerald-500 text-white" : active ? "bg-[var(--teal-deep)] text-[var(--ivory)]" : "bg-[var(--ivory-2)] text-[var(--muted-foreground)]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                {n < totalSteps && <div className={`h-px flex-1 ${done ? "bg-emerald-500" : "bg-[var(--border)]"}`} />}
              </div>
            );
          })}
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleNext}>
          {step === 1 && (
            <>
              <div>
                <Label className="text-[var(--teal-deep)]">Selecciona tu rol</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {roleOptions.map((r) => {
                    const active = role === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm transition-all ${
                          active ? "border-[var(--teal-deep)] bg-[var(--ivory-2)] text-[var(--teal-deep)]" : "border-[var(--border)] bg-white text-[var(--teal-deep)]/80 hover:border-[var(--teal-deep)]/30"
                        }`}
                      >
                        <r.icon className={`w-4 h-4 ${active ? "text-[var(--terracotta)]" : ""}`} /> {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fn" className="text-[var(--teal-deep)]">Nombres</Label>
                  <Input id="fn" placeholder="Juana" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                    value={formData.firstName} onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="ln" className="text-[var(--teal-deep)]">Apellidos</Label>
                  <Input id="ln" placeholder="Quispe" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                    value={formData.lastName} onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))} required />
                </div>
              </div>

              <div>
                <Label htmlFor="em" className="text-[var(--teal-deep)]">Correo</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input id="em" type="email" placeholder="tu@correo.pe" className="pl-9 h-11 bg-white border-[var(--border)]"
                    value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>

              <div>
                <Label htmlFor="pw" className="text-[var(--teal-deep)]">Contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input id="pw" type="password" placeholder="Mínimo 8 caracteres" className="pl-9 h-11 bg-white border-[var(--border)]"
                    value={formData.password} onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {role === "buyer" ? (
                <>
                  <div>
                    <Label htmlFor="rs" className="text-[var(--teal-deep)]">Razón social</Label>
                    <div className="relative mt-1.5">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <Input id="rs" placeholder="Textil Andina S.A.C." className="pl-9 h-11 bg-white border-[var(--border)]"
                        value={formData.razonSocial} onChange={(e) => setFormData(f => ({ ...f, razonSocial: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ruc" className="text-[var(--teal-deep)]">RUC</Label>
                      <Input id="ruc" placeholder="20XXXXXXXXX" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                        value={formData.ruc} onChange={(e) => setFormData(f => ({ ...f, ruc: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="sector" className="text-[var(--teal-deep)]">Sector</Label>
                      <Input id="sector" placeholder="Textil / Exportación" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                        value={formData.sector} onChange={(e) => setFormData(f => ({ ...f, sector: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dir" className="text-[var(--teal-deep)]">Dirección fiscal</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <Input id="dir" placeholder="Av. ..." className="pl-9 h-11 bg-white border-[var(--border)]"
                        value={formData.address} onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="dni" className="text-[var(--teal-deep)]">DNI</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <Input id="dni" placeholder="00000000" className="pl-9 h-11 bg-white border-[var(--border)]"
                        value={formData.dni} onChange={(e) => setFormData(f => ({ ...f, dni: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="com" className="text-[var(--teal-deep)]">Comunidad / Asociación</Label>
                    <Input id="com" placeholder="Asoc. Tinta Alpaquera" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                      value={formData.community} onChange={(e) => setFormData(f => ({ ...f, community: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="reg" className="text-[var(--teal-deep)]">Región</Label>
                      <Input id="reg" placeholder="Puno" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                        value={formData.region} onChange={(e) => setFormData(f => ({ ...f, region: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="prov" className="text-[var(--teal-deep)]">Provincia</Label>
                      <Input id="prov" placeholder="Lampa" className="mt-1.5 h-11 bg-white border-[var(--border)]"
                        value={formData.province} onChange={(e) => setFormData(f => ({ ...f, province: e.target.value }))} />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    La ubicación exacta no será pública. Solo se comparte bajo solicitud formal y tu consentimiento.
                  </p>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              {!env.isConfigured && (
                <p className="text-sm text-[var(--terracotta)] bg-[var(--pink)]/30 rounded-xl px-4 py-3">
                  Antes de registrar usuarios reales, configurá <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                </p>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--ivory-2)] p-5 space-y-3">
                <h3 className="text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>Consentimiento de datos</h3>
                {[
                  "Acepto los términos de operación dentro de AlpaCash.",
                  "Autorizo el uso de datos comerciales para generar mi historial verificable.",
                  "Comprendo que el contacto directo se libera solo bajo proceso formal.",
                  "Acepto recibir avisos de solicitudes, validaciones y precios referenciales.",
                ].map((t, i) => (
                  <label key={i} className="flex items-start gap-3 text-sm text-[var(--teal-deep)]/85">
                    <input type="checkbox" defaultChecked={i < 3} className="mt-1" />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                AlpaCash no aprueba ni otorga créditos. Tu historial puede ayudarte a sustentar oportunidades ante aliados externos.
              </p>
            </>
          )}

          {error && (
            <p className="text-sm text-[var(--terracotta)] bg-[var(--pink)]/30 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-[var(--teal-deep)]/80 hover:text-[var(--teal-deep)]">
                Atrás
              </button>
            ) : <span />}
            <Button type="submit" disabled={loading || (step === totalSteps && !env.isConfigured)} className="h-12 rounded-full bg-[var(--teal-deep)] hover:bg-[var(--teal-700)] text-[var(--ivory)] px-6 disabled:opacity-60">
              {step === totalSteps ? (loading ? "Creando cuenta…" : "Crear cuenta") : "Siguiente"} <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--teal-deep)]/80">
          ¿Ya tienes cuenta?{" "}
          <button onClick={onLogin} className="text-[var(--terracotta)] hover:underline" style={{ fontWeight: 500 }}>
            Ingresar
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

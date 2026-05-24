"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Factory, Landmark, ArrowRight, User, MapPin, Building2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ROLE_TO_ROUTE, type Role } from "@/lib/supabase/types";
import {
  isLettersOnly,
  isValidDni,
  isValidRuc,
  normalizeSpaces,
  sanitizeAlphanumeric,
  sanitizeDigits,
  sanitizeLetters,
} from "@/lib/forms/validation";

const ROLE_OPTIONS: { id: Exclude<Role, "admin">; icon: typeof Sprout; label: string; desc: string }[] = [
  { id: "productor", icon: Sprout, label: "Productor / Asociación", desc: "Publicás lotes y construís historial." },
  { id: "empresa", icon: Factory, label: "Comprador / Empresa", desc: "Buscás lotes trazables y gestionás compras." },
  { id: "financiera", icon: Landmark, label: "Aliado financiero", desc: "Consultás reportes autorizados por productores." },
];

export function CompleteProfileForm({
  userId,
  email,
  fullName,
  avatarUrl,
}: {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Exclude<Role, "admin">>("productor");
  const [name, setName] = useState(fullName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productorData, setProductorData] = useState({ dni: "", community: "", region: "Puno", province: "" });
  const [empresaData, setEmpresaData] = useState({ razonSocial: "", ruc: "", sector: "", address: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedName = normalizeSpaces(name);
    if (!normalizedName || !isLettersOnly(normalizedName)) {
      setError("Necesitamos tu nombre completo para crear el perfil.");
      return;
    }
    if (role === "productor") {
      const dni = sanitizeDigits(productorData.dni, 8);
      if (dni && !isValidDni(dni)) {
        setError("El DNI debe tener 8 dígitos.");
        return;
      }
      if (productorData.region && !isLettersOnly(productorData.region)) {
        setError("La región solo puede contener letras.");
        return;
      }
      if (productorData.province && !isLettersOnly(productorData.province)) {
        setError("La provincia solo puede contener letras.");
        return;
      }
    }
    if (role === "empresa" || role === "financiera") {
      const ruc = sanitizeDigits(empresaData.ruc, 11);
      if (ruc && !isValidRuc(ruc)) {
        setError("El RUC debe tener 11 dígitos.");
        return;
      }
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { error: profileError } = await supabase.from("profiles").upsert(
        { id: userId, nombre: normalizedName, email, rol: role, avatar_url: avatarUrl },
        { onConflict: "id" }
      );

      if (profileError) {
        setError(`No se pudo guardar tu perfil: ${profileError.message}`);
        return;
      }

      if (role === "productor") {
        const { error: e } = await supabase.from("productores").insert({
          profile_id: userId,
          codigo_productor: `AC-${Date.now().toString(36).toUpperCase()}`,
          dni_ruc: sanitizeDigits(productorData.dni, 8) || null,
          nombre_asociacion: normalizeSpaces(productorData.community) || null,
          comunidad: normalizeSpaces(productorData.community) || null,
          provincia: normalizeSpaces(productorData.province) || null,
          region: normalizeSpaces(productorData.region) || "Puno",
        });
        if (e) {
          setError(`Perfil creado pero faltó guardar datos de productor: ${e.message}`);
          return;
        }
      } else if (role === "empresa") {
        const { error: e } = await supabase.from("empresas").insert({
          profile_id: userId,
          ruc: sanitizeDigits(empresaData.ruc, 11) || null,
          razon_social: normalizeSpaces(empresaData.razonSocial) || normalizedName,
          rubro: normalizeSpaces(empresaData.sector) || null,
          direccion: normalizeSpaces(empresaData.address) || null,
        });
        if (e) {
          setError(`Perfil creado pero faltó guardar datos de empresa: ${e.message}`);
          return;
        }
      } else if (role === "financiera") {
        const { error: e } = await supabase.from("entidades_financieras").insert({
          profile_id: userId,
          razon_social: normalizeSpaces(empresaData.razonSocial) || normalizedName,
          ruc: sanitizeDigits(empresaData.ruc, 11) || null,
        });
        if (e) {
          setError(`Perfil creado pero faltó guardar datos de la entidad: ${e.message}`);
          return;
        }
      }

      router.push(ROLE_TO_ROUTE[role]);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const needsProductorFields = role === "productor";
  const needsEmpresaFields = role === "empresa" || role === "financiera";

  return (
    <AuthShell
      eyebrow="Bienvenido a AlpaCash"
      quote="Un último paso: contanos quién sos en la red."
      image="https://images.unsplash.com/photo-1568805711729-f0cde40b5b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
    >
      <div>
        <h1 className="text-3xl tracking-tight text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>Completá tu perfil</h1>
        <p className="mt-2 text-sm text-[var(--teal-deep)]/70">
          Tu cuenta {email} ya está activa. Falta elegir tu rol para personalizar tu experiencia.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <Label className="text-[var(--teal-deep)]">¿Cómo vas a usar AlpaCash?</Label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => {
                const active = role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      active ? "border-[var(--teal-deep)] bg-[var(--ivory-2)]" : "border-[var(--border)] bg-white hover:border-[var(--teal-deep)]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>
                      <r.icon className={`w-4 h-4 ${active ? "text-[var(--terracotta)]" : ""}`} />
                      {r.label}
                    </div>
                    <div className="mt-1 text-xs text-[var(--teal-deep)]/70">{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="nombre" className="text-[var(--teal-deep)]">Nombre completo</Label>
            <Input
              id="nombre"
              value={name}
              onChange={(e) => setName(sanitizeLetters(e.target.value))}
              placeholder="Juana Quispe"
              className="mt-1.5 h-11 bg-white border-[var(--border)]"
              required
            />
          </div>

          {needsProductorFields && (
            <>
              <div>
                <Label htmlFor="dni" className="text-[var(--teal-deep)]">DNI</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="dni"
                    placeholder="00000000"
                    className="pl-9 h-11 bg-white border-[var(--border)]"
                    value={productorData.dni}
                    onChange={(e) => setProductorData((d) => ({ ...d, dni: sanitizeDigits(e.target.value, 8) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="comunidad" className="text-[var(--teal-deep)]">Comunidad / Asociación</Label>
                <Input
                  id="comunidad"
                  placeholder="Asoc. Tinta Alpaquera"
                  className="mt-1.5 h-11 bg-white border-[var(--border)]"
                  value={productorData.community}
                  onChange={(e) => setProductorData((d) => ({ ...d, community: sanitizeAlphanumeric(e.target.value) }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="region" className="text-[var(--teal-deep)]">Región</Label>
                  <Input
                    id="region"
                    placeholder="Puno"
                    className="mt-1.5 h-11 bg-white border-[var(--border)]"
                    value={productorData.region}
                    onChange={(e) => setProductorData((d) => ({ ...d, region: sanitizeLetters(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="provincia" className="text-[var(--teal-deep)]">Provincia</Label>
                  <Input
                    id="provincia"
                    placeholder="Lampa"
                    className="mt-1.5 h-11 bg-white border-[var(--border)]"
                    value={productorData.province}
                    onChange={(e) => setProductorData((d) => ({ ...d, province: sanitizeLetters(e.target.value) }))}
                  />
                </div>
              </div>
            </>
          )}

          {needsEmpresaFields && (
            <>
              <div>
                <Label htmlFor="rs" className="text-[var(--teal-deep)]">Razón social</Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="rs"
                    placeholder="Textil Andina S.A.C."
                    className="pl-9 h-11 bg-white border-[var(--border)]"
                    value={empresaData.razonSocial}
                    onChange={(e) => setEmpresaData((d) => ({ ...d, razonSocial: sanitizeAlphanumeric(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ruc" className="text-[var(--teal-deep)]">RUC</Label>
                  <Input
                    id="ruc"
                    placeholder="20XXXXXXXXX"
                    className="mt-1.5 h-11 bg-white border-[var(--border)]"
                    value={empresaData.ruc}
                    onChange={(e) => setEmpresaData((d) => ({ ...d, ruc: sanitizeDigits(e.target.value, 11) }))}
                  />
                </div>
                {role === "empresa" && (
                  <div>
                    <Label htmlFor="sector" className="text-[var(--teal-deep)]">Sector</Label>
                    <Input
                      id="sector"
                      placeholder="Textil"
                      className="mt-1.5 h-11 bg-white border-[var(--border)]"
                      value={empresaData.sector}
                      onChange={(e) => setEmpresaData((d) => ({ ...d, sector: sanitizeAlphanumeric(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
              {role === "empresa" && (
                <div>
                  <Label htmlFor="dir" className="text-[var(--teal-deep)]">Dirección fiscal</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <Input
                      id="dir"
                      placeholder="Av. ..."
                      className="pl-9 h-11 bg-white border-[var(--border)]"
                      value={empresaData.address}
                      onChange={(e) => setEmpresaData((d) => ({ ...d, address: sanitizeAlphanumeric(e.target.value) }))}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-[var(--terracotta)] bg-[var(--pink)]/30 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[var(--teal-deep)] hover:bg-[var(--teal-700)] text-[var(--ivory)] disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Entrar a AlpaCash"} <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}

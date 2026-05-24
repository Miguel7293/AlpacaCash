import { Sprout, Factory, LayoutDashboard, Landmark, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export type RoleId = "producer" | "buyer" | "admin" | "financial";

const roles: { id: RoleId; icon: typeof Sprout; title: string; desc: string; soon?: boolean }[] = [
  { id: "producer", icon: Sprout, title: "Productor / Asociación", desc: "Publica lotes, recibe solicitudes, construye historial y accede a mejores oportunidades." },
  { id: "buyer", icon: Factory, title: "Comprador / Empresa", desc: "Explora lotes trazables, compara calidad, solicita compra y gestiona facturas." },
  { id: "admin", icon: LayoutDashboard, title: "Administrador", desc: "Controla usuarios, lotes, solicitudes, reportes, facturación y seguridad." },
  { id: "financial", icon: Landmark, title: "Aliado financiero", desc: "Consulta reportes autorizados para evaluar oportunidades de financiamiento." },
];

export function RoleSelector({ onBack, onPick }: { onBack?: () => void; onPick?: (id: RoleId) => void }) {
  const [selected, setSelected] = useState<RoleId | null>(null);

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[var(--teal-deep)]/80 hover:text-[var(--teal-deep)]">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <a href="#" className="flex items-center gap-2">
            <img src="/ALPACASH.svg" alt="AlpaCash Logo" className="h-8 w-auto" />
            <span className="text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>AlpaCash</span>
          </a>
        </div>

        <div className="mt-14 text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--terracotta)]">Onboarding</div>
          <h1 className="mt-3 text-4xl tracking-tight text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>
            ¿Cómo usarás AlpaCash?
          </h1>
          <p className="mt-3 text-[var(--teal-deep)]/70">
            Elige tu rol para personalizar tu experiencia. Podrás invitar a tu equipo más adelante.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => {
            const active = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => !r.soon && setSelected(r.id)}
                disabled={r.soon}
                className={`text-left rounded-2xl border p-6 transition-all bg-white relative ${
                  active
                    ? "border-[var(--teal-deep)] ring-4 ring-[var(--gold-soft)]/40 shadow-lg -translate-y-0.5"
                    : "border-[var(--border)] hover:border-[var(--teal-deep)]/30 hover:shadow-md"
                } ${r.soon ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {r.soon && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    Próximamente
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? "bg-[var(--teal-deep)] text-[var(--ivory)]" : "bg-[var(--ivory-2)] text-[var(--teal-deep)]"}`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <div className="mt-4 text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>{r.title}</div>
                <div className="mt-1 text-sm text-[var(--teal-deep)]/70 leading-relaxed">{r.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-[var(--muted-foreground)] max-w-md">
            Tu información personal no se mostrará públicamente. El contacto directo se habilita solo bajo proceso formal.
          </p>
          <Button
            disabled={!selected}
            onClick={() => selected && onPick?.(selected)}
            className="bg-[var(--teal-deep)] hover:bg-[var(--teal-700)] text-[var(--ivory)] rounded-full px-6 h-12 disabled:opacity-50"
          >
            Continuar <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

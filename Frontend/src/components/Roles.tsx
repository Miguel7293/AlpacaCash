import { Sprout, Factory, LayoutDashboard, Landmark, ArrowRight } from "lucide-react";

const roles = [
  {
    icon: Sprout,
    title: "Productor / Asociación",
    desc: "Publica lotes, recibe solicitudes, construye historial y accede a mejores oportunidades.",
    cta: "Soy productor",
    accent: "bg-[var(--gold)] text-[var(--teal-deep)]",
    bg: "from-[var(--ivory)] to-[var(--gold-soft)]/30",
  },
  {
    icon: Factory,
    title: "Comprador / Empresa",
    desc: "Explora lotes trazables, compara calidad, solicita compra y gestiona facturas.",
    cta: "Soy comprador",
    accent: "bg-[var(--terracotta)] text-white",
    bg: "from-[var(--ivory)] to-[var(--terracotta)]/15",
  },
  {
    icon: LayoutDashboard,
    title: "Administrador",
    desc: "Controla usuarios, lotes, solicitudes, reportes, facturación y seguridad.",
    cta: "Acceso admin",
    accent: "bg-[var(--alpaca-brown)] text-white",
    bg: "from-[var(--ivory)] to-[var(--alpaca-brown)]/20",
  },
  {
    icon: Landmark,
    title: "Aliado financiero",
    desc: "Consulta reportes autorizados para evaluar oportunidades de financiamiento.",
    cta: "Soy aliado financiero",
    accent: "bg-sky-600 text-white",
    bg: "from-[var(--ivory)] to-sky-100",
  },
];

export function Roles({ onPick }: { onPick?: () => void }) {
  return (
    <section id="como" className="py-24 bg-[var(--ivory-2)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--terracotta)]">Roles</div>
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight text-[var(--teal-deep)]" style={{ fontWeight: 600, lineHeight: 1.15 }}>
            ¿Cómo usarás AlpaCash?
          </h2>
          <p className="mt-4 text-[var(--teal-deep)]/70">
            Cuatro perfiles, una misma red de confianza comercial alpaquera.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => (
            <div
              key={r.title}
              className={`relative rounded-3xl border border-[var(--border)] p-7 bg-gradient-to-br ${r.bg} hover:shadow-xl transition-shadow flex flex-col`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${r.accent}`}>
                <r.icon className="w-6 h-6" />
              </div>
              <h3 className="mt-5 text-lg text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>{r.title}</h3>
              <p className="mt-2 text-sm text-[var(--teal-deep)]/70 leading-relaxed flex-1">{r.desc}</p>
              <button
                onClick={onPick}
                className="mt-5 inline-flex items-center gap-2 text-[var(--teal-deep)] group"
              >
                <span style={{ fontWeight: 500 }}>{r.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sprout, Factory, ShieldCheck, LayoutDashboard, Landmark,
  Plus, TrendingUp, Package, ShoppingCart, Users, FileBarChart, Clock,
  Activity, AlertTriangle, CheckCircle2, ClipboardList, BookOpen, MapPin,
  Wallet, Building2, FileText, Bell, Search
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type RoleKey = "producer" | "buyer" | "admin" | "financial";

const ROLES: { key: RoleKey; icon: typeof Sprout; label: string; tagline: string; theme: string }[] = [
  { key: "producer", icon: Sprout, label: "Productor", tagline: "Mobile-first, acción y progreso", theme: "from-[var(--gold-soft)]/40 to-[var(--ivory)]" },
  { key: "buyer", icon: Factory, label: "Comprador", tagline: "Desktop B2B, abastecimiento y riesgo", theme: "from-[var(--terracotta)]/15 to-[var(--ivory)]" },
  { key: "admin", icon: LayoutDashboard, label: "Administrador", tagline: "Operaciones, tablas y auditoría", theme: "from-[var(--alpaca-brown)]/20 to-[var(--ivory)]" },
  { key: "financial", icon: Landmark, label: "Aliado financiero", tagline: "Reportes referenciales autorizados", theme: "from-sky-100 to-[var(--ivory)]" },
];

const salesData = [
  { m: "Ene", v: 12 }, { m: "Feb", v: 18 }, { m: "Mar", v: 15 },
  { m: "Abr", v: 24 }, { m: "May", v: 31 }, { m: "Jun", v: 28 },
];
const priceData = [
  { m: "L", v: 31.2 }, { m: "M", v: 32.0 }, { m: "X", v: 31.8 },
  { m: "J", v: 32.6 }, { m: "V", v: 33.1 }, { m: "S", v: 32.9 }, { m: "D", v: 33.4 },
];

export function RolePreviews() {
  const [role, setRole] = useState<RoleKey>("producer");
  const current = ROLES.find((r) => r.key === role)!;

  return (
    <section id="demo" className="py-24 bg-[var(--ivory)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--terracotta)]">Demo · Interfaces por rol</div>
          <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight text-[var(--teal-deep)]" style={{ fontWeight: 600, lineHeight: 1.15 }}>
            Una plataforma. Cuatro experiencias distintas.
          </h2>
          <p className="mt-4 text-[var(--teal-deep)]/70">
            Cada rol ve y opera lo que necesita: el productor en su celular, el comprador en su panel B2B, el admin con
            tablas y auditoría, el aliado financiero con reportes autorizados.
          </p>
        </div>

        {/* Role tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {ROLES.map((r) => {
            const active = r.key === role;
            return (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm ${
                  active
                    ? "bg-[var(--teal-deep)] text-[var(--ivory)] border-[var(--teal-deep)] shadow-lg"
                    : "bg-white text-[var(--teal-deep)] border-[var(--border)] hover:border-[var(--teal-deep)]/30"
                }`}
              >
                <r.icon className={`w-4 h-4 ${active ? "text-[var(--gold-soft)]" : ""}`} />
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center text-xs text-[var(--muted-foreground)]">{current.tagline}</div>

        {/* Preview canvas */}
        <div className={`mt-8 rounded-[2rem] p-6 sm:p-10 bg-gradient-to-br ${current.theme} border border-[var(--border)] relative overflow-hidden`}>
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/40 blur-3xl pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              {role === "producer" && <ProducerPreview />}
              {role === "buyer" && <BuyerPreview />}
              {role === "admin" && <AdminPreview />}
              {role === "financial" && <FinancialPreview />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ============== Mock chrome ============== */

function BrowserChrome({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-[var(--ivory)] border border-[var(--border)] shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-white">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--terracotta-soft)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold-soft)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <div className="mx-auto text-xs text-[var(--muted-foreground)]">app.alpacash.pe/{label}</div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function PhoneChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[280px] sm:w-[320px] rounded-[2.5rem] bg-[var(--teal-deep)] p-2.5 shadow-2xl">
      <div className="rounded-[2rem] bg-[var(--ivory)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2 text-[10px] text-[var(--teal-deep)]">
          <span>9:41</span>
          <span className="w-16 h-3.5 bg-[var(--teal-deep)] rounded-full" />
          <span>100%</span>
        </div>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

/* ============== Previews ============== */

function ProducerPreview() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-7 order-2 lg:order-1">
        <PhoneChrome>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[var(--muted-foreground)]">Hola,</div>
              <div className="text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>Juana Q.</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--gold)]/30 flex items-center justify-center text-[var(--teal-deep)]">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-[var(--teal-deep)] text-[var(--ivory)] p-4">
            <div className="text-[10px] text-[var(--gold-soft)] uppercase tracking-wider">Nivel de confianza</div>
            <div className="text-2xl mt-1" style={{ fontWeight: 600 }}>Sólido</div>
            <div className="mt-2 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full w-[68%] bg-[var(--gold)]" />
            </div>
            <div className="mt-1.5 text-[10px] text-[var(--ivory)]/70">4 de 6 hitos completados</div>
          </div>
          <button className="mt-3 w-full py-3 rounded-2xl bg-[var(--terracotta)] text-white flex items-center justify-center gap-2 text-sm" style={{ fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Registrar nuevo lote
          </button>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { v: "3", l: "Activos" },
              { v: "8", l: "Ventas" },
              { v: "S/ 4.2k", l: "Ingresos" },
            ].map((s) => (
              <div key={s.l} className="bg-white border border-[var(--border)] rounded-xl p-2">
                <div className="text-[var(--teal-deep)] text-sm" style={{ fontWeight: 600 }}>{s.v}</div>
                <div className="text-[9px] text-[var(--muted-foreground)]">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[var(--muted-foreground)]">Lote más reciente</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Validado</span>
            </div>
            <div className="mt-1 text-[var(--teal-deep)] text-sm" style={{ fontWeight: 600 }}>AC-2048 · Baby · 120 lb</div>
            <div className="mt-1 text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[var(--terracotta)]" /> Puno · 8 ventas
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)] text-[var(--teal-deep)]">
            {[Package, BookOpen, Wallet, ClipboardList].map((Icon, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 text-[9px] py-1 rounded-lg ${i === 0 ? "bg-[var(--ivory-2)]" : ""}`}>
                <Icon className="w-4 h-4" />
                <span>{["Lotes", "Cursos", "Pagos", "Más"][i]}</span>
              </div>
            ))}
          </div>
        </PhoneChrome>
      </div>

      <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
        <Highlight icon={Activity} title="Mobile-first y cálido" desc="CTA gigante para registrar lote, nivel de confianza visible y navegación inferior simple." />
        <Highlight icon={CheckCircle2} title="Progreso, no presión" desc="Hitos suaves (perfil, capacitación, primer lote validado) sin lenguaje bancario." />
        <Highlight icon={BookOpen} title="Capacitaciones a la mano" desc="Cursos cortos que mejoran el nivel de confianza sin volverse requisito punitivo." />
      </div>
    </div>
  );
}

function BuyerPreview() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-8">
        <BrowserChrome label="comprador">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">Panel de abastecimiento</div>
              <div className="text-[var(--teal-deep)] text-lg" style={{ fontWeight: 600 }}>Textil Andina S.A.C.</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <input placeholder="Buscar lotes…" className="pl-7 pr-3 h-8 text-xs rounded-full bg-white border border-[var(--border)]" />
              </div>
              <div className="w-7 h-7 rounded-full bg-[var(--terracotta)] text-white text-[10px] flex items-center justify-center">3</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { i: Package, l: "Disponibles", v: "1,284" },
              { i: ShoppingCart, l: "Carrito", v: "2" },
              { i: FileText, l: "Órdenes", v: "9" },
              { i: ShieldCheck, l: "Riesgo bajo", v: "94%" },
            ].map((k) => (
              <div key={k.l} className="bg-white rounded-xl border border-[var(--border)] p-3">
                <k.i className="w-4 h-4 text-[var(--teal-deep)]" />
                <div className="mt-2 text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>{k.v}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">{k.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-3">
            <div className="col-span-3 bg-white rounded-xl border border-[var(--border)] p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[var(--muted-foreground)]">Precio Baby Alpaca · 7d</div>
                <span className="text-[10px] text-emerald-600 inline-flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +2.1%</span>
              </div>
              <div className="h-24 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient id="bp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--teal-deep)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--teal-deep)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" hide />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 10 }} />
                    <Area type="monotone" dataKey="v" stroke="var(--teal-deep)" fill="url(#bp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-span-2 bg-white rounded-xl border border-[var(--border)] p-3">
              <div className="text-xs text-[var(--muted-foreground)]">Compra con menor riesgo</div>
              <div className="mt-2 space-y-1.5 text-[11px]">
                {[
                  ["Lote validado", true],
                  ["Productor verificado", true],
                  ["Certificación externa", false],
                  ["Historial disponible", true],
                ].map(([l, ok]) => (
                  <div key={String(l)} className="flex items-center gap-2 text-[var(--teal-deep)]">
                    {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 bg-white rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] flex items-center justify-between">
              <span>Lotes recomendados para tu empresa</span>
              <span className="text-[10px]">Ver todos →</span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {[
                  ["AC-2061", "Súper Baby", "Cusco", "85 lb", "S/ 42.00", "+2.4%"],
                  ["AC-2118", "Fleece", "Cusco", "140 lb", "S/ 24.50", "+2.1%"],
                  ["AC-2102", "Baby", "Puno", "95 lb", "S/ 35.00", "+7.7%"],
                ].map((r, i) => (
                  <tr key={i} className={i % 2 ? "bg-[var(--ivory)]/50" : ""}>
                    <td className="px-3 py-2 text-[var(--teal-deep)]" style={{ fontWeight: 500 }}>{r[0]}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{r[1]}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{r[2]}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{r[3]}</td>
                    <td className="px-3 py-2 text-[var(--teal-deep)]" style={{ fontWeight: 500 }}>{r[4]}</td>
                    <td className="px-3 py-2 text-emerald-600">{r[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrowserChrome>
      </div>
      <div className="lg:col-span-4 space-y-4">
        <Highlight icon={LayoutDashboard} title="Desktop B2B" desc="Tablas densas, filtros avanzados, comparador y carrito B2B con cotización." />
        <Highlight icon={ShieldCheck} title="Compra con menor riesgo" desc="Checklist de validación, historial del productor y datos protegidos visibles por nivel." />
        <Highlight icon={TrendingUp} title="Inteligencia de mercado" desc="Tendencias semanales, alertas de lotes bajo el promedio y recomendaciones por perfil." />
      </div>
    </div>
  );
}

function AdminPreview() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-8">
        <BrowserChrome label="admin">
          <div className="grid grid-cols-12 gap-3">
            <aside className="col-span-3 bg-[var(--teal-deep)] text-[var(--ivory)] rounded-xl p-3 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)] mb-2">Admin</div>
              {["Usuarios", "Productores", "Empresas", "Lotes", "Transacciones", "Facturación", "Reportes", "Auditoría"].map((s, i) => (
                <div key={s} className={`px-2 py-1.5 rounded-lg text-[11px] ${i === 3 ? "bg-white/15" : ""}`}>{s}</div>
              ))}
            </aside>
            <div className="col-span-9 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "Usuarios nuevos", v: "+128", c: "text-emerald-600" },
                  { l: "Lotes pendientes", v: "23", c: "text-amber-600" },
                  { l: "Reclamos", v: "4", c: "text-[var(--terracotta)]" },
                  { l: "Ingresos plataf.", v: "S/ 18.2k", c: "text-[var(--teal-deep)]" },
                ].map((k) => (
                  <div key={k.l} className="bg-white border border-[var(--border)] rounded-lg p-2.5">
                    <div className="text-[10px] text-[var(--muted-foreground)]">{k.l}</div>
                    <div className={`mt-1 ${k.c}`} style={{ fontWeight: 600 }}>{k.v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-[var(--muted-foreground)]">Lotes registrados · 6 meses</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Total · 412</div>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <XAxis dataKey="m" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 10 }} />
                      <Bar dataKey="v" fill="var(--terracotta)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] flex items-center justify-between">
                  <span>Lotes por validar</span>
                  <span className="text-[10px] text-[var(--terracotta)]">Acciones rápidas</span>
                </div>
                <table className="w-full text-[11px]">
                  <thead className="bg-[var(--ivory)] text-[var(--muted-foreground)]">
                    <tr className="text-left">
                      <th className="px-3 py-1.5">Lote</th><th className="px-3 py-1.5">Productor</th>
                      <th className="px-3 py-1.5">Categ.</th><th className="px-3 py-1.5">Región</th>
                      <th className="px-3 py-1.5">Estado</th><th className="px-3 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {[
                      ["AC-2089", "J. Mamani", "Med. Fleece", "Puno", "En revisión", "amber"],
                      ["AC-2147", "Asoc. Tinta", "Gruesa", "Puno", "En revisión", "amber"],
                      ["AC-2155", "L. Ccama", "Baby", "Cusco", "Observado", "red"],
                    ].map((r, i) => (
                      <tr key={i} className="text-[var(--teal-deep)]">
                        <td className="px-3 py-1.5" style={{ fontWeight: 500 }}>{r[0]}</td>
                        <td className="px-3 py-1.5">{r[1]}</td>
                        <td className="px-3 py-1.5">{r[2]}</td>
                        <td className="px-3 py-1.5">{r[3]}</td>
                        <td className="px-3 py-1.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${r[5] === "amber" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{r[4]}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <span className="text-[10px] text-[var(--teal-deep)]/70">Aprobar · Rechazar</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </BrowserChrome>
      </div>
      <div className="lg:col-span-4 space-y-4">
        <Highlight icon={Users} title="Operaciones, no marketing" desc="Sidebar denso por módulos: usuarios, lotes, transacciones, reclamos, auditoría." />
        <Highlight icon={FileBarChart} title="Métricas de plataforma" desc="Ingresos, lotes pendientes, reclamos abiertos y capacitaciones en una sola mirada." />
        <Highlight icon={AlertTriangle} title="Auditoría completa" desc="Logs por usuario y acción, con estado anterior/nuevo para trazar cada cambio." />
      </div>
    </div>
  );
}

function FinancialPreview() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-7">
        <BrowserChrome label="aliado">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">Reportes referenciales autorizados</div>
              <div className="text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>Caja Andina · Evaluación</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">No es aprobación crediticia</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Productores autorizados", v: "1,284", i: Users },
              { l: "Reportes generados", v: "342", i: FileText },
              { l: "Volumen referenciado", v: "S/ 1.8M", i: Wallet },
            ].map((k) => (
              <div key={k.l} className="bg-white rounded-xl border border-[var(--border)] p-3">
                <k.i className="w-4 h-4 text-sky-600" />
                <div className="mt-2 text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>{k.v}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">{k.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white border border-[var(--border)] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Juana Quispe Q.</div>
                <div className="text-[var(--teal-deep)] text-sm" style={{ fontWeight: 600 }}>Perfil financiable · Sólido</div>
              </div>
              <Building2 className="w-5 h-5 text-[var(--muted-foreground)]" />
            </div>
            <div className="mt-3 grid grid-cols-6 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full ${i < 4 ? "bg-[var(--gold)]" : "bg-[var(--ivory-2)]"}`} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
              {[
                ["Ventas verif.", "8"], ["Cumplimiento", "100%"],
                ["Capacitación", "4/4"], ["Antigüedad", "14m"],
              ].map(([l, v]) => (
                <div key={l} className="bg-[var(--ivory-2)] rounded-md p-1.5">
                  <div className="text-[var(--muted-foreground)]">{l}</div>
                  <div className="text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-[var(--muted-foreground)] leading-relaxed">
              AlpaCash no aprueba ni otorga créditos. Este reporte resume evidencia comercial autorizada por el productor.
            </p>
          </div>
        </BrowserChrome>
      </div>
      <div className="lg:col-span-5 space-y-4">
        <Highlight icon={Landmark} title="Solo con consentimiento" desc="Acceso a reportes solo cuando el productor lo autoriza explícitamente." />
        <Highlight icon={FileBarChart} title="Evidencia, no scoring opaco" desc="Volumen, cumplimiento, capacitación y antigüedad explican el nivel referencial." />
        <Highlight icon={ShieldCheck} title="Sin promesas crediticias" desc="AlpaCash no aprueba créditos. El aliado financiero evalúa según sus propios criterios." />
      </div>
    </div>
  );
}

function Highlight({ icon: Icon, title, desc }: { icon: typeof Sprout; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
      <div className="w-10 h-10 rounded-xl bg-[var(--ivory-2)] text-[var(--teal-deep)] flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="mt-4 text-[var(--teal-deep)]" style={{ fontWeight: 600 }}>{title}</h4>
      <p className="mt-1 text-sm text-[var(--teal-deep)]/70 leading-relaxed">{desc}</p>
    </div>
  );
}

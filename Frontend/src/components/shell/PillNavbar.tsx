import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, X, Globe, Search } from "lucide-react";

export type NavTarget = "landing" | "marketplace" | "demo" | "prices" | "trust" | "login" | "register";

export function PillNavbar({
  current,
  onNavigate,
  onLogin,
  onRegister,
}: {
  current: NavTarget;
  onNavigate: (t: NavTarget) => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"ES" | "EN">("ES");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: { key: NavTarget; label: string }[] = [
    { key: "marketplace", label: lang === "ES" ? "Marketplace" : "Market" },
    { key: "demo", label: lang === "ES" ? "Roles" : "Roles" },
    { key: "prices", label: lang === "ES" ? "Precios" : "Prices" },
    { key: "trust", label: lang === "ES" ? "Confianza" : "Trust" },
  ];

  return (
    <>
      {/* Capa de fondo desenfocado detrás de los elementos flotantes cuando se hace scroll */}
      <div
        className={`fixed top-0 left-0 right-0 h-20 z-[45] transition-all duration-300 pointer-events-none ${
          scrolled
            ? "bg-[var(--ivory)]/75 backdrop-blur-md border-b border-[var(--border)] opacity-100"
            : "opacity-0"
        }`}
      />

      {/* Logo top-left + lang top-right */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 pt-4 sm:pt-6 flex items-start justify-between">
          {/* Logo */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => onNavigate("landing")}
            className="pointer-events-auto flex items-center gap-2.5 group"
          >
            <div className="relative">
              <img src="/ALPACASH.svg" alt="AlpaCash" className="h-11 w-auto group-hover:scale-105 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--terracotta)] border-2 border-[var(--ivory)]" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-[20px] text-[var(--ink)] tracking-tight" style={{ fontWeight: 600 }}>
                AlpaCash
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink)]/60">
                est. 2026 · Puno PE
              </span>
            </div>
          </motion.button>

          {/* Lang + Search */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button onClick={() => onNavigate("marketplace")} className="w-10 h-10 rounded-full bg-[var(--ivory)] border border-[var(--ink)]/15 flex items-center justify-center text-[var(--ink)] hover:bg-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-[var(--ivory)] border border-[var(--ink)]/15">
              {(["ES", "EN"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    lang === l ? "bg-[var(--ink)] text-[var(--ivory)]" : "text-[var(--ink)]/70"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {l}
                </button>
              ))}
              <span className="px-2 text-[9px] text-[var(--ink)]/40 font-mono uppercase tracking-wider">AYM·soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Pill Nav (desktop) */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden lg:flex fixed top-5 left-1/2 -translate-x-1/2 z-50"
      >
        <div className={`flex items-center gap-1 p-1.5 rounded-full bg-[var(--ink)] text-[var(--ivory)] transition-all ${scrolled ? "shadow-2xl scale-[0.97]" : "shadow-xl"}`}>
          {links.map((l) => {
            const active = current === l.key;
            return (
              <button
                key={l.key}
                onClick={() => onNavigate(l.key)}
                className="relative px-5 py-2 rounded-full text-sm transition-colors"
                style={{ fontWeight: 500 }}
              >
                {active && (
                  <motion.span
                    layoutId="pill-active"
                    className="absolute inset-0 rounded-full bg-[var(--gold)]"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                )}
                <span className={`relative ${active ? "text-[var(--ink)]" : "text-[var(--ivory)]/85 hover:text-[var(--ivory)]"}`}>
                  {l.label}
                </span>
              </button>
            );
          })}
          <div className="w-px h-5 bg-[var(--ivory)]/15 mx-1" />
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-full text-sm text-[var(--ivory)]/85 hover:text-[var(--ivory)]"
            style={{ fontWeight: 500 }}
          >
            Ingresar
          </button>
          <button
            onClick={onRegister}
            className="px-5 py-2 rounded-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-soft)] text-white text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            Empezar →
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu trigger (floating bottom) */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="px-5 py-3 rounded-full bg-[var(--ink)] text-[var(--ivory)] shadow-2xl flex items-center gap-3"
          style={{ fontWeight: 500 }}
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-sm">Menú</span>
          <span className="w-px h-4 bg-white/20" />
          <span className="text-sm text-[var(--gold)]" style={{ fontWeight: 600 }}>Empezar</span>
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed bottom-20 left-4 right-4 z-50 bg-[var(--ink)] text-[var(--ivory)] rounded-3xl p-5 shadow-2xl"
        >
          <div className="grid grid-cols-2 gap-2">
            {links.map((l) => (
              <button
                key={l.key}
                onClick={() => { onNavigate(l.key); setOpen(false); }}
                className="text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
              >
                <div className="font-display text-lg">{l.label}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => { onLogin(); setOpen(false); }} className="py-3 rounded-2xl border border-white/15 text-sm">Ingresar</button>
            <button onClick={() => { onRegister(); setOpen(false); }} className="py-3 rounded-2xl bg-[var(--terracotta)] text-white text-sm" style={{ fontWeight: 600 }}>Empezar →</button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono uppercase text-[var(--ivory)]/40">
            <Globe className="w-3 h-3" /> ES · EN · AYM próximamente
          </div>
        </motion.div>
      )}
    </>
  );
}

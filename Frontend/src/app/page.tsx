"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillNavbar, type NavTarget } from "@/components/shell/PillNavbar";
import { LivePriceTicker } from "@/components/LivePriceTicker";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { PublicMarketplace } from "@/components/PublicMarketplace";
import { MarketPrices } from "@/components/MarketPrices";
import { Trust } from "@/components/Trust";
import { Impact } from "@/components/Impact";
import { Roles } from "@/components/Roles";
import { RolePreviews } from "@/components/RolePreviews";
import { Languages } from "@/components/Languages";
import { CTAFooter } from "@/components/CTAFooter";
import { ProducerDashboard } from "@/components/screens/ProducerDashboard";
import { BuyerDashboard } from "@/components/screens/BuyerDashboard";
import { AdminDashboard } from "@/components/screens/AdminDashboard";
import { FinancialDashboard } from "@/components/screens/FinancialDashboard";
import { LotDetailModal } from "@/components/modals/LotDetailModal";
import { NewLotModal } from "@/components/modals/NewLotModal";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { motion } from "motion/react";
import { AlpacaHead, FactorySimple, ShieldWeave, Vault } from "@/components/icons/AlpaIcons";
import type { DisplayLot } from "@/components/modals/LotDetailModal";

type DemoView = "demo-producer" | "demo-buyer" | "demo-admin" | "demo-financial";

export default function Home() {
  const router = useRouter();
  const [demoView, setDemoView] = useState<DemoView | null>(null);
  const [lotOpen, setLotOpen] = useState(false);
  const [newLotOpen, setNewLotOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<DisplayLot | null>(null);

  const goLanding = () => setDemoView(null);

  if (demoView === "demo-producer")
    return (
      <>
        <ProducerDashboard onBack={goLanding} onOpenLot={() => setLotOpen(true)} onNewLot={() => setNewLotOpen(true)} />
        <LotDetailModal open={lotOpen} lot={selectedLot} onClose={() => setLotOpen(false)} />
        <NewLotModal open={newLotOpen} onClose={() => setNewLotOpen(false)} />
      </>
    );
  if (demoView === "demo-buyer")
    return (
        <>
        <BuyerDashboard onBack={goLanding} onOpenLot={(lot) => { setSelectedLot(lot ?? null); setLotOpen(true); }} onOpenCart={() => setCartOpen(true)} />
        <LotDetailModal open={lotOpen} lot={selectedLot} onClose={() => setLotOpen(false)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </>
    );
  if (demoView === "demo-admin") return <AdminDashboard onBack={goLanding} />;
  if (demoView === "demo-financial") return <FinancialDashboard onBack={goLanding} />;

  const onNav = (t: NavTarget) => {
    if (t === "landing") return goLanding();
    if (t === "marketplace") return router.push("/marketplace");
    if (t === "login") return router.push("/auth/login");
    if (t === "register") return router.push("/auth/register");
    if (t === "demo") {
      document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (t === "prices") {
      document.getElementById("prices")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (t === "trust") {
      document.getElementById("trust")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  };

  const roleCards = [
    { v: "demo-producer" as DemoView, label: "Productor", desc: "Esquila, lotes, ofertas, ingresos.", icon: <AlpacaHead size={28} />, c: "var(--terracotta)" },
    { v: "demo-buyer" as DemoView, label: "Comprador", desc: "Mercado, trazabilidad, compras.", icon: <FactorySimple size={28} />, c: "var(--teal-500)" },
    { v: "demo-admin" as DemoView, label: "Administrador", desc: "Sala de control y privacidad.", icon: <ShieldWeave size={28} />, c: "var(--plum)" },
    { v: "demo-financial" as DemoView, label: "Financiero", desc: "Scoring, vouchers y seguros.", icon: <Vault size={28} />, c: "var(--teal-700)" },
  ];

  return (
    <div className="min-h-screen bg-[var(--ivory)] text-[var(--foreground)]">
      <PillNavbar current="landing" onNavigate={onNav} onLogin={() => router.push("/auth/login")} onRegister={() => router.push("/auth/register")} />
      <LivePriceTicker />
      <main>
        <Hero onPrimary={() => router.push("/auth/register")} onSecondary={() => router.push("/auth/register")} onExplore={() => router.push("/marketplace")} />

        <section id="demo" className="relative py-20 bg-[var(--ivory-2)] overflow-hidden">
          <div className="absolute inset-0 grain opacity-50 pointer-events-none" />
          <div className="max-w-[1500px] mx-auto px-5 sm:px-8 relative">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-px bg-[var(--ink)]/40" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink)]/60">N°02 · Demo en vivo · 4 roles</span>
                </div>
                 <h2 className="font-display leading-[0.95] text-[var(--ink)]" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 500 }}>
                   Cuatro oficios.<br />
                   <em className="font-editorial text-[var(--terracotta)]" style={{ fontWeight: 400 }}>Una sola</em> red.
                 </h2>
               </div>
               <p className="font-editorial italic text-[var(--ink)]/70 max-w-md">
                 &ldquo;Cada rol entra a una experiencia hecha a su medida dentro de la plataforma real.&rdquo;
               </p>
             </div>

             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {roleCards.map((d, i) => (
                 <motion.div
                   key={d.v}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.07 }}
                   whileHover={{ y: -6 }}
                   className="text-left"
                 >
                   <div className="relative bg-[var(--paper)] rounded-3xl border-2 border-[var(--ink)] brutalist-shadow-sm p-5 h-full">
                     <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-[var(--ink)] text-[var(--ivory)] font-mono text-[10px]" style={{ fontWeight: 600 }}>
                       N°{String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="w-16 h-16 rounded-2xl border-2 border-[var(--ink)] flex items-center justify-center text-[var(--ivory)]" style={{ background: d.c }}>
                      {d.icon}
                    </div>
                     <div className="font-display text-2xl mt-4" style={{ fontWeight: 600 }}>{d.label}</div>
                     <p className="text-sm text-[var(--ink)]/70 mt-1">{d.desc}</p>
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>
        </section>

        <PublicMarketplace onExplore={() => router.push("/marketplace")} />
        <RolePreviews />
        <Problem />
        <Solution />
        <div id="prices"><MarketPrices /></div>
        <div id="trust"><Trust /></div>
        <Impact />
        <Roles onPick={() => router.push("/auth/register")} />
        <Languages />
        <CTAFooter />
      </main>
    </div>
  );
}

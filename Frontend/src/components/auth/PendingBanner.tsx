"use client";

import { Clock } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

export function PendingBanner() {
  const { estado, loading } = useAuth();

  if (loading || estado !== "pendiente") return null;

  return (
    <div className="bg-[var(--gold)]/40 border-b-2 border-[var(--ink)]/10">
      <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-2.5 flex items-center gap-3 text-sm">
        <Clock className="w-4 h-4 text-[var(--terracotta-deep)] shrink-0" />
        <p className="text-[var(--ink)]/85">
          <span style={{ fontWeight: 600 }}>Tu cuenta está en revisión.</span>{" "}
          Podés explorar el panel, pero algunas acciones quedan habilitadas cuando un administrador apruebe tu registro.
        </p>
      </div>
    </div>
  );
}

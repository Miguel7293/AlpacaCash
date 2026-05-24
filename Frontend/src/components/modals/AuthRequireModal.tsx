"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ShieldAlert, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthRequireModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--ink)]/70 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="fixed inset-x-4 bottom-10 sm:inset-0 sm:m-auto sm:max-w-md sm:h-fit z-50"
          >
            <div className="bg-[var(--paper)] rounded-3xl border-2 border-[var(--ink)] brutalist-shadow p-6 sm:p-8 flex flex-col relative overflow-hidden">
              {/* Tape strip style decoration */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-[var(--gold)]/80 rotate-[-3deg] rounded-sm z-10" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--ivory)] flex items-center justify-center hover:bg-[var(--terracotta)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--pink)]/30 border-2 border-[var(--ink)] flex items-center justify-center text-[var(--terracotta)] mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>

                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink)]/60">
                  Acceso Restringido
                </div>
                <h3 className="font-display text-2xl mt-1 text-[var(--teal-deep)]" style={{ fontWeight: 700 }}>
                  Ingreso Requerido
                </h3>

                <p className="text-sm text-[var(--ink)]/70 mt-3 leading-relaxed">
                  Para poder gestionar tu carrito de compras, ver detalles del productor y enviar solicitudes de cotización, necesitas iniciar sesión o registrarte con una cuenta en AlpaCash.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => handleNavigate("/auth/login")}
                  className="w-full py-3 px-4 rounded-full bg-[var(--teal-deep)] text-[var(--ivory)] hover:bg-[var(--teal-700)] transition-colors flex items-center justify-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  <LogIn className="w-4 h-4" /> Iniciar Sesión
                </button>

                <button
                  onClick={() => handleNavigate("/auth/register")}
                  className="w-full py-3 px-4 rounded-full border-2 border-[var(--ink)] bg-white text-[var(--teal-deep)] hover:bg-[var(--ivory-2)] transition-colors flex items-center justify-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  <UserPlus className="w-4 h-4" /> Registrarse
                </button>

                <button
                  onClick={onClose}
                  className="mt-2 text-xs text-[var(--ink)]/60 hover:text-[var(--ink)] hover:underline text-center"
                >
                  Volver al Marketplace
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

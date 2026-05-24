"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SupabaseRow = Record<string, unknown>;

export type ProducerLotRecord = {
  recordId: string;
  id: string;
  cat: string;
  color: string;
  lb: number;
  price: number;
  st: "Activo" | "En oferta" | "Vendido" | "Borrador";
  origin: string;
  esquila: string;
};

export type MarketplaceLotRecord = {
  recordId: string;
  id: string;
  cat: string;
  color: string;
  origin: string;
  lb: number;
  price: number;
  prod: string;
  grade: string;
  certified: boolean;
  productorId: string;
};

export type PaymentRecord = {
  id: string;
  date: string;
  lot: string;
  buyer: string;
  amount: number;
  lb: number;
  status: "pagado" | "pendiente" | "en proceso";
};

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
};

export type OfferRecord = {
  recordId: string;
  id: string;
  buyer: string;
  lot: string;
  offerPrice: number;
  askPrice: number;
  lb: number;
  time: string;
  status: "pendiente" | "aceptada" | "rechazada" | "contraoferta" | "contra-enviada";
  counterPrice?: number;
};

export type AdminUserRecord = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export type CreditRecord = {
  id: string;
  applicant: string;
  amount: number;
  status: string;
  score: number;
};

export type VoucherRecord = {
  id: string;
  title: string;
  amountLabel: string;
  status: string;
};

export type PurchaseOrderRecord = {
  id: string;
  supplier: string;
  total: number;
  status: string;
  eta: string;
};

export type LogisticsRecord = {
  id: string;
  route: string;
  lot: string;
  progress: number;
  state: string;
};

export type QualityRecord = {
  id: string;
  category: string;
  grade: string;
  color: string;
  yieldLabel: string;
  certifiedLabel: string;
};

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function mapLotStatus(value: unknown): ProducerLotRecord["st"] {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("vend")) return "Vendido";
  if (normalized.includes("oferta") || normalized.includes("reserv")) return "En oferta";
  if (normalized.includes("borr")) return "Borrador";
  return "Activo";
}

function mapPaymentStatus(value: unknown): PaymentRecord["status"] {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("pag")) return "pagado";
  if (normalized.includes("pend")) return "pendiente";
  return "en proceso";
}

export function useProducerLots() {
  const [lots, setLots] = useState<ProducerLotRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lotes_fibra")
        .select("id,codigo_lote,peso_libras,precio_por_libra,color,estado,ubicacion_general,fecha_esquila,categorias_fibra(nombre)")
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setLots(
            data.map((row: SupabaseRow) => ({
              recordId: asString(row.id, ""),
              id: asString(row.codigo_lote, asString(row.id, "Lote")),
              cat: asString((row.categorias_fibra as SupabaseRow | null)?.nombre, "Fibra"),
              color: asString(row.color, "Sin color"),
              lb: asNumber(row.peso_libras),
              price: asNumber(row.precio_por_libra),
              st: mapLotStatus(row.estado),
              origin: asString(row.ubicacion_general, "Origen reservado"),
              esquila: asString(row.fecha_esquila, "Sin fecha"),
            }))
          );
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { lots, loading, setLots };
}

export function useMarketplaceLots() {
  const [lots, setLots] = useState<MarketplaceLotRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lotes_fibra")
        .select("id,codigo_lote,peso_libras,precio_por_libra,color,ubicacion_general,estado,productor_id,categorias_fibra(nombre,nivel_calidad),productores(id,nombre_asociacion,comunidad)")
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setLots(
            data.map((row: SupabaseRow) => {
              const producer = row.productores as SupabaseRow | null;
              const category = row.categorias_fibra as SupabaseRow | null;
              return {
                recordId: asString(row.id, ""),
                id: asString(row.codigo_lote, "Lote"),
                cat: asString(category?.nombre, "Fibra"),
                color: asString(row.color, "Sin color"),
                origin: asString(row.ubicacion_general, "Origen reservado"),
                lb: asNumber(row.peso_libras),
                price: asNumber(row.precio_por_libra),
                prod: asString(producer?.nombre_asociacion || producer?.comunidad, "Productor verificado"),
                grade: String(category?.nivel_calidad ?? "A"),
                certified: asString(row.estado).toLowerCase() === "disponible",
                productorId: asString(row.productor_id, asString(producer?.id, "")),
              };
            })
          );
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { lots, loading };
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          id,
          created_at,
          precio_por_libra,
          lotes_fibra (
            codigo_lote,
            peso_libras
          ),
          empresas (
            razon_social,
            profiles (
              nombre
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setPayments(
            data.map((row: SupabaseRow, index) => {
              const lot = row.lotes_fibra as SupabaseRow | null;
              const company = row.empresas as SupabaseRow | null;
              const profile = company?.profiles as SupabaseRow | null;
              
              const price = asNumber(row.precio_por_libra);
              const lbs = asNumber(lot?.peso_libras);
              
              return {
                id: asString(row.id, `TX-${index + 1}`),
                date: asString(row.created_at, "Sin fecha"),
                lot: asString(lot?.codigo_lote, "Sin lote"),
                buyer: asString(company?.razon_social || profile?.nombre, "Comprador"),
                amount: price * lbs,
                lb: lbs,
                status: "en proceso",
              };
            })
          );
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { payments, loading };
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase.from("notificaciones").select("*").order("created_at", { ascending: false }).limit(5);
      if (!cancelled && !error && Array.isArray(data)) {
        setItems(
          data.map((row: SupabaseRow, index) => ({
            id: asString(row.id, `notif-${index}`),
            title: asString(row.titulo, asString(row.title, "Notificación")),
            body: asString(row.mensaje, asString(row.body, "Sin detalle")),
          }))
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => items, [items]);
}

export function useOffers() {
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("solicitudes_compra")
        .select(`
          id,
          created_at,
          estado,
          lotes_fibra (
            codigo_lote,
            precio_por_libra,
            peso_libras
          ),
          empresas (
            razon_social,
            profiles (
              nombre
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setOffers(
            data.map((row: SupabaseRow, index) => {
              const lot = row.lotes_fibra as SupabaseRow | null;
              const company = row.empresas as SupabaseRow | null;
              const profile = company?.profiles as SupabaseRow | null;
              
              const lotPrice = asNumber(lot?.precio_por_libra);
              
              return {
                recordId: asString(row.id, ""),
                id: asString(row.id, `OF-${index + 1}`),
                buyer: asString(company?.razon_social || profile?.nombre, "Comprador"),
                lot: asString(lot?.codigo_lote, "Sin lote"),
                offerPrice: lotPrice,
                askPrice: lotPrice,
                lb: asNumber(lot?.peso_libras, 0),
                time: asString(row.created_at, "Sin fecha"),
                status: (["aceptada", "rechazada", "contraoferta", "contra-enviada"].includes(asString(row.estado).toLowerCase())
                  ? asString(row.estado).toLowerCase()
                  : "pendiente") as OfferRecord["status"],
              };
            })
          );
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { offers, loading, setOffers };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("profiles").select("id,nombre,rol,estado").order("created_at", { ascending: false });
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setUsers(
            data.map((row: SupabaseRow, index) => ({
              id: asString(row.id, `user-${index}`),
              name: asString(row.nombre, "Usuario"),
              role: asString(row.rol, "Sin rol"),
              status: asString(row.estado, "Activo"),
            }))
          );
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { users, loading };
}

export function useCredits() {
  const [credits, setCredits] = useState<CreditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("evaluaciones_crediticias").select("*").order("created_at", { ascending: false });
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setCredits(
            data.map((row: SupabaseRow, index) => ({
              id: asString(row.id, `cred-${index}`),
              applicant: asString(row.nombre_productor, asString(row.applicant_name, "Productor")),
              amount: asNumber(row.monto_solicitado, asNumber(row.amount)),
              status: asString(row.estado, "En evaluación"),
              score: asNumber(row.score, asNumber(row.puntaje)),
            }))
          );
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { credits, loading };
}

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          id,
          created_at,
          precio_por_libra,
          lotes_fibra (
            peso_libras
          ),
          productores (
            nombre_asociacion,
            comunidad
          )
        `)
        .order("created_at", { ascending: false }).limit(20);
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setOrders(
            data.map((row: SupabaseRow, index) => {
              const lot = row.lotes_fibra as SupabaseRow | null;
              const producer = row.productores as SupabaseRow | null;
              
              const price = asNumber(row.precio_por_libra);
              const lbs = asNumber(lot?.peso_libras);
              
              return {
                id: asString(row.id, `PO-${index + 1}`),
                supplier: asString(producer?.nombre_asociacion || producer?.comunidad, "Proveedor verificado"),
                total: price * lbs,
                status: "En proceso",
                eta: asString(row.created_at, "Sin ETA"),
              };
            })
          );
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { orders, loading };
}

export function useLogistics() {
  const [shipments, setShipments] = useState<LogisticsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          id,
          lotes_fibra (
            codigo_lote,
            ubicacion_general
          ),
          empresas (
            direccion
          )
        `)
        .order("created_at", { ascending: false }).limit(12);
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setShipments(
            data.map((row: SupabaseRow, index) => {
              const lot = row.lotes_fibra as SupabaseRow | null;
              const company = row.empresas as SupabaseRow | null;
              return {
                id: asString(row.id, `ship-${index + 1}`),
                route: `${asString(lot?.ubicacion_general, "Origen")} → ${asString(company?.direccion, "Destino")}`,
                lot: asString(lot?.codigo_lote, "Sin lote"),
                progress: 55,
                state: "En tránsito",
              };
            })
          );
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { shipments, loading };
}

export function useQualityReports() {
  const [reports, setReports] = useState<QualityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lotes_fibra")
        .select("id,codigo_lote,color,estado,peso_libras,precio_por_libra,categorias_fibra(nombre,nivel_calidad)")
        .order("created_at", { ascending: false })
        .limit(12);
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setReports(
            data.map((row: SupabaseRow, index) => {
              const category = row.categorias_fibra as SupabaseRow | null;
              const quality = asNumber(category?.nivel_calidad, 0);
              return {
                id: asString(row.codigo_lote, asString(row.id, `quality-${index + 1}`)),
                category: asString(category?.nombre, "Fibra"),
                grade: quality > 0 ? `Nivel ${quality}` : "Sin nivel",
                color: asString(row.color, "Sin color"),
                yieldLabel: `${asNumber(row.peso_libras).toLocaleString()} lb`,
                certifiedLabel: asString(row.estado, "Sin estado"),
              };
            })
          );
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { reports, loading };
}

export function useShearingSchedule() {
  const { lots, loading } = useProducerLots();

  const schedule = useMemo(() => {
    const normalized = lots
      .filter((lot) => lot.esquila && lot.esquila !== "Sin fecha")
      .map((lot, index) => ({
        id: lot.recordId || `${lot.origin}-${index}`,
        date: lot.esquila,
        cabana: lot.origin || "Origen reservado",
        animals: Math.max(1, Math.round(lot.lb / 6)),
        estimatedLb: lot.lb,
        done: false,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cabanasMap = new Map();
    for (const item of normalized) {
      const current = cabanasMap.get(item.cabana) || { name: item.cabana, animals: 0, lastEsquila: item.date, next: item.date, color: 'var(--gold)' };
      current.animals += item.animals;
      current.next = item.date;
      cabanasMap.set(item.cabana, current);
    }

    return {
      upcoming: normalized.slice(0, 6),
      cabanas: Array.from(cabanasMap.values()).map((entry, index) => ({
        ...entry,
        color: ['var(--gold)', 'var(--terracotta)', 'var(--teal-500)', 'var(--mint)'][index % 4],
      })),
    };
  }, [lots]);

  return { ...schedule, loading };
}

export function useVouchers() {
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transacciones")
        .select(`
          id,
          precio_por_libra,
          lotes_fibra (
            codigo_lote,
            peso_libras
          )
        `)
        .order("created_at", { ascending: false }).limit(10);
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setVouchers(
            data.map((row: SupabaseRow, index) => {
              const lot = row.lotes_fibra as SupabaseRow | null;
              const price = asNumber(row.precio_por_libra);
              const lbs = asNumber(lot?.peso_libras);
              return {
                id: asString(row.id, `voucher-${index}`),
                title: asString(lot?.codigo_lote, "Voucher"),
                amountLabel: `S/ ${(price * lbs).toLocaleString()}`,
                status: "Activo",
              };
            })
          );
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { vouchers, loading };
}

import { Request, Response } from "express";
import { supabaseAdmin } from "../../config/supabase";

export async function getMarketplaceLots(req: Request, res: Response) {
  const { categoria, region, precioMin, precioMax } = req.query;

  let query = supabaseAdmin
    .from("marketplace_lotes_publicos")
    .select("*")
    .eq("estado_lote", "disponible");

  if (categoria) {
    query = query.eq("categoria", String(categoria));
  }

  if (region) {
    query = query.eq("region", String(region));
  }

  if (precioMin) {
    query = query.gte("precio_por_libra", Number(precioMin));
  }

  if (precioMax) {
    query = query.lte("precio_por_libra", Number(precioMax));
  }

  const { data, error } = await query.order("precio_por_libra", {
    ascending: true,
  });

  if (error) {
    return res.status(500).json({
      message: "Error al obtener lotes del marketplace",
      error: error.message,
    });
  }

  return res.json(data);
}
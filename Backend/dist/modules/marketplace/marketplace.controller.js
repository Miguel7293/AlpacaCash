"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketplaceLots = getMarketplaceLots;
const supabase_1 = require("../../config/supabase");
async function getMarketplaceLots(req, res) {
    const { categoria, region, precioMin, precioMax } = req.query;
    let query = supabase_1.supabaseAdmin
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

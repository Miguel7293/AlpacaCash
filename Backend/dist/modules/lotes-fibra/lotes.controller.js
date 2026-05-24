"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLote = createLote;
exports.getMisLotes = getMisLotes;
async function createLote(req, res) {
    try {
        const supabase = req.supabaseUser;
        const { categoria_id, codigo_lote, peso_libras, color, precio_por_libra, ubicacion_general, fecha_esquila, descripcion, } = req.body;
        const { data: productor, error: productorError } = await supabase
            .from("productores")
            .select("id")
            .eq("profile_id", req.user.id)
            .single();
        if (productorError || !productor) {
            return res.status(404).json({
                message: "Productor no encontrado",
            });
        }
        const { data, error } = await supabase
            .from("lotes_fibra")
            .insert({
            productor_id: productor.id,
            categoria_id,
            codigo_lote,
            peso_libras,
            peso_disponible: peso_libras,
            color,
            precio_por_libra,
            ubicacion_general,
            fecha_esquila,
            descripcion,
            estado: "disponible",
        })
            .select()
            .single();
        if (error) {
            return res.status(400).json({
                message: "Error al crear lote",
                error: error.message,
            });
        }
        return res.status(201).json(data);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error interno al crear lote",
        });
    }
}
async function getMisLotes(req, res) {
    const supabase = req.supabaseUser;
    const { data: productor, error: productorError } = await supabase
        .from("productores")
        .select("id")
        .eq("profile_id", req.user.id)
        .single();
    if (productorError || !productor) {
        return res.status(404).json({
            message: "Productor no encontrado",
        });
    }
    const { data, error } = await supabase
        .from("lotes_fibra")
        .select("*, categorias_fibra(nombre)")
        .eq("productor_id", productor.id)
        .order("created_at", { ascending: false });
    if (error) {
        return res.status(500).json({
            message: "Error al obtener lotes",
            error: error.message,
        });
    }
    return res.json(data);
}

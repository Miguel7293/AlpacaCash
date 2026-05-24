"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = getMyProfile;
exports.updateMyProfile = updateMyProfile;
const supabase_1 = require("../../config/supabase");
async function getMyProfile(req, res) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .single();
    if (error || !data) {
        return res.status(404).json({ message: "Perfil no encontrado" });
    }
    return res.json(data);
}
async function updateMyProfile(req, res) {
    const allowedFields = ["nombre", "telefono", "avatar_url"];
    const updates = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No hay campos válidos para actualizar" });
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", req.user.id)
        .select()
        .single();
    if (error) {
        return res.status(500).json({
            message: "Error al actualizar el perfil",
            error: error.message,
        });
    }
    return res.json(data);
}

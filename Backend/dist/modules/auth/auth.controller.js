"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.createProfile = createProfile;
const supabase_1 = require("../../config/supabase");
// Uses verifyToken (not authMiddleware) so Google OAuth users without a profile
// get { hasProfile: false } instead of a 403.
async function getMe(req, res) {
    const { data: profile } = await supabase_1.supabaseAdmin
        .from("profiles")
        .select("id, email, nombre, rol, estado")
        .eq("id", req.user.id)
        .maybeSingle();
    if (!profile) {
        return res.status(200).json({
            id: req.user.id,
            email: req.user.email,
            hasProfile: false,
        });
    }
    if (profile.estado === "suspendido" || profile.estado === "rechazado") {
        return res.status(403).json({ message: "Cuenta inactiva" });
    }
    return res.json({
        id: profile.id,
        email: profile.email,
        nombre: profile.nombre,
        rol: profile.rol,
        estado: profile.estado,
        hasProfile: true,
    });
}
async function createProfile(req, res) {
    const { rol, nombre } = req.body;
    const validRoles = ["productor", "empresa", "admin", "capacitador"];
    if (!rol || !validRoles.includes(rol)) {
        return res.status(400).json({
            message: "Rol inválido. Valores permitidos: productor, empresa, admin, capacitador",
        });
    }
    if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
        return res.status(400).json({ message: "El campo 'nombre' es requerido" });
    }
    const { data: existing } = await supabase_1.supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", req.user.id)
        .maybeSingle();
    if (existing) {
        return res.status(409).json({ message: "El perfil ya existe" });
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("profiles")
        .insert({
        id: req.user.id,
        email: req.user.email,
        nombre: nombre.trim(),
        rol,
        // estado defaults to 'pendiente' in DB — admin must activate
    })
        .select()
        .single();
    if (error) {
        return res.status(500).json({
            message: "Error al crear el perfil",
            error: error.message,
        });
    }
    return res.status(201).json(data);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.authMiddleware = authMiddleware;
const supabase_1 = require("../config/supabase");
// Validates token only — does NOT require a profile to exist.
// Use this for endpoints that run before the profile is created (e.g. POST /api/auth/profile).
async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token no enviado" });
        }
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error, } = await supabase_1.supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }
        req.user = { id: user.id, email: user.email };
        req.supabaseUser = (0, supabase_1.createSupabaseUserClient)(token);
        next();
    }
    catch {
        return res.status(500).json({ message: "Error de autenticación" });
    }
}
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token no enviado",
            });
        }
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error, } = await supabase_1.supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                message: "Token inválido o expirado",
            });
        }
        const { data: profile, error: profileError } = await supabase_1.supabaseAdmin
            .from("profiles")
            .select("id, email, nombre, rol, estado")
            .eq("id", user.id)
            .single();
        if (profileError || !profile) {
            return res.status(403).json({
                message: "Perfil no encontrado",
            });
        }
        if (profile.estado === "suspendido" || profile.estado === "rechazado") {
            return res.status(403).json({
                message: "Cuenta inactiva",
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            rol: profile.rol,
            nombre: profile.nombre,
            estado: profile.estado,
        };
        req.supabaseUser = (0, supabase_1.createSupabaseUserClient)(token);
        next();
    }
    catch (error) {
        return res.status(500).json({
            message: "Error de autenticación",
        });
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }
        if (!roles.includes(req.user.rol || "")) {
            return res.status(403).json({
                message: "No tienes permisos para realizar esta acción",
            });
        }
        next();
    };
}

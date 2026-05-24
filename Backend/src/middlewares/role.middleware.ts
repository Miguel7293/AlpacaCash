import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
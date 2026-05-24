import { Request, Response, NextFunction } from "express";
import { supabaseAdmin, createSupabaseUserClient } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    rol?: string;
  };
  supabaseUser?: ReturnType<typeof createSupabaseUserClient>;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no enviado",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        message: "Token inválido o expirado",
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, rol, estado")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        message: "Perfil no encontrado",
      });
    }

    if (profile.estado === "suspendido") {
      return res.status(403).json({
        message: "Usuario suspendido",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      rol: profile.rol,
    };

    req.supabaseUser = createSupabaseUserClient(token);

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error de autenticación",
    });
  }
}
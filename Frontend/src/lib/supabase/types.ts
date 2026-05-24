export type Role = "productor" | "empresa" | "admin" | "financiera";

export type Estado = "pendiente" | "activo" | "suspendido" | "rechazado";

export type UserProfile = {
  id: string;
  email: string;
  nombre: string;
  telefono?: string | null;
  rol: Role;
  estado: Estado;
  avatar_url?: string | null;
};

export const ROLE_TO_ROUTE: Record<Role, string> = {
  productor: "/dashboard/productor",
  empresa: "/dashboard/comprador",
  admin: "/dashboard/administrador",
  financiera: "/dashboard/financiero",
};

export const ROUTE_TO_ROLE: Record<string, Role> = {
  productor: "productor",
  comprador: "empresa",
  administrador: "admin",
  financiero: "financiera",
};

export const ROLE_ID_TO_ROLE: Record<string, Role> = {
  producer: "productor",
  buyer: "empresa",
  admin: "admin",
  financial: "financiera",
};

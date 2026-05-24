import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLE_TO_ROUTE, type Role } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Resolvémos el origin público dinámicamente para reverse proxies (Render, Vercel)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  
  const origin = envUrl
    ? (envUrl.startsWith("http") ? envUrl : `https://${envUrl}`).replace(/\/+$/, "")
    : (host ? `${proto}://${host}` : new URL(request.url).origin);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_user`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, estado")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(`${origin}/auth/complete-profile`);
  }

  if (profile.estado === "pendiente" || profile.estado === "suspendido" || profile.estado === "rechazado") {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=cuenta-${profile.estado}`);
  }

  const destination = ROLE_TO_ROUTE[profile.rol as Role] ?? "/";
  return NextResponse.redirect(`${origin}${destination}`);
}

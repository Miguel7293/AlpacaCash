import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { ROLE_TO_ROUTE, ROUTE_TO_ROLE, type Role } from "@/lib/supabase/types";

export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env.isConfigured) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("error", "supabase-config");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.url!,
    env.anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("rol, estado")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("error", "no-profile");
      return NextResponse.redirect(loginUrl);
    }

    if (profile.estado === "suspendido" || profile.estado === "rechazado") {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("error", "cuenta-" + profile.estado);
      return NextResponse.redirect(loginUrl);
    }

    const routeSegment = pathname.split("/")[2];
    const expectedRole = ROUTE_TO_ROLE[routeSegment];
    const userRole = profile.rol as Role;

    if (expectedRole && userRole !== expectedRole) {
      const correctRoute = ROLE_TO_ROUTE[userRole];
      if (correctRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = correctRoute;
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

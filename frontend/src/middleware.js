import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isDiscover = request.nextUrl.pathname.startsWith('/discover');
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding');

  // 1. Protection: If not logged in, redirect to login
  if (!user && (isDiscover || isOnboarding)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Role-based enforcement
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const role = profile?.role || 'none';

    // If no role, force onboarding
    if (role === 'none' && isDiscover) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // If already has role, stay in discover
    if (role !== 'none' && isOnboarding) {
      return NextResponse.redirect(new URL("/discover", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/discover", "/discover/:path*", "/onboarding", "/auth/callback"],
}





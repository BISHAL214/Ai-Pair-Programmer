// app/auth/callback/route.ts
import { supabaseAnonKey, supabaseUrl } from "@/constants";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  console.log("Auth callback URL:", request.url);
  console.log("Search Params:", searchParams.toString());
  // if "code" is in param, exchange it for a session
  const code = searchParams.get("code");
  console.log("Authorization code:", code);
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";
  console.log("Next redirect path:", next);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  console.error(
    "Authentication error: No code found or session exchange failed.",
  );
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

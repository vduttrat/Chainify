import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request){
    let response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name,value,options}) => {
                        response.cookies.set(name,value,options)
                    })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url))
    }
}

export const config = {
    matcher: ["/discover","/discover/:path*"],
}

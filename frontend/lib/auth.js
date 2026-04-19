import { supabase } from "./supabase";

export async function signIn() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/auth/callback?next=/discover`,
        },
    })
}


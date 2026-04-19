import { supabase } from "./supabase";

export async function signIn(){
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: "http://localhost:3000/discover",
        },
    })
}

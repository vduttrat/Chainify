"use client"

import { useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"

export default function Page() {
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
            }
        };
        checkUser();
    }, []);

    return (
        <PageWrapper>
            <Sidebar />
            <main className="ml-[15vw] min-h-screen h-full">
                {/* Discover content will go here */}
            </main>
        </PageWrapper>
    )
}


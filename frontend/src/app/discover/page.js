"use client"

import { signOut } from "next-auth/react"
import PageWrapper from "../components/pagewrapper"
import Sidebar from "../components/sidebar"

export default function Page(){
    return (
    <PageWrapper>
            <Sidebar />
            <main className="ml-[15vw] min-h-screen h-full">

            </main>
    </PageWrapper>
    )
}

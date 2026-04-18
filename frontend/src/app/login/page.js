"use client";

import { signIn } from "../../../lib/auth";
import { FaGoogle } from "react-icons/fa";
import NavButton from "../components/navbutton";
import PageWrapper from "../components/pagewrapper";

export default function Page(){
    return(
    <PageWrapper className="space-y-6 flex items-center justify-center">
        <div className="rounded-4xl w-[45vw] h-[55vh] bg-[rgba(255,255,255,0.2)] shadow-xl/100 shadow-black border-8 border-black flex justify-center items-center">
            <div className="animate-in slide_in duration-600">
                <button
                    className="py-6 px-13 rounded-2xl m-10 bg-amber-300 text-3xl text-black inline-block shadow-lg shadow-amber-200 hover:scale-102 duration-200 active:scale-95 font-semibold"
                    onClick={() => signIn()}
                > Continue with Google <FaGoogle className="inline-block mb-1 ml-4"/>  </button>
            </div>
        </div>
    </PageWrapper>
    )
}

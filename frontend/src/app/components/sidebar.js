"use client";
import Link from "next/link";
import { FaRegUser } from "react-icons/fa"
import { IoSettingsOutline } from "react-icons/io5"
import { CiLogout } from "react-icons/ci"
import { signOut } from "next-auth/react"
import { FaReact } from "react-icons/fa"

export default function Sidebar() {
    const links = [
        {
            label: "Discover",
            route: "/discover",
            icon: (
                <FaReact className="inline-block mb-1"/>
            )
        },
        {
            label: "Profile",
            route: "/",
            icon: (
                <FaRegUser className="inline-block mb-1"/>
            )
        },
        {
            label: "Settings",
            route: "/",
            icon: (
                <IoSettingsOutline className="inline-block mb-1"/>
            )
        },
    ];

    const handleSignOut = () => {
        signOut()
    }

    const SidebarButton = ({link}) => {
        return (
        <div className="w-[15vw] text-center text-[rgba(255,255,255,0.8)] hover:scale-110 hover:text-[rgb(255,255,255)] duration-200">
            <Link className="text-2xl space-x-6" href={link.route}>
            {link.icon}
            <span>{link.label}</span>
            </Link>
        </div>
        ) 
    }

    return(
    <div className="absolute left-0 top-0 w-[15vw] min-h-screen h-full border-r-6 border-[rgba(255,255,255,0.6)]">
        <ul className="mt-[20vh]">
        {
            links.map((_link,idx)=>(
                <li className="mt-[10vh]" key={idx}>
                    <SidebarButton link={_link} />
                </li>
            ))
        }
        <li className="mt-[10vh]">
            <div className="w-[15vw] text-center text-[rgba(255,255,255,0.8)] hover:scale-110 hover:text-[rgb(255,255,255)] duration-200">
                <button className="text-2xl space-x-6" onClick={() => handleSignOut()}>
                    <CiLogout className="inline-block"/>
                    <span> Log out </span>
                </button>
            </div>
        </li>
        </ul>
    </div>
    )
}

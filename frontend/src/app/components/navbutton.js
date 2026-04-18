import Link from "next/link";

export default function NavButton({link,className="",text=""}){
    return(
    <Link className={"py-6 px-13 rounded-2xl m-10 bg-amber-300 text-3xl text-black inline-block shadow-lg shadow-amber-200 hover:scale-102 duration-200 active:scale-95 font-bold " + className} href={link}>
        {text}
    </Link>
    )  
}

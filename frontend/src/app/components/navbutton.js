import Link from "next/link";

export default function NavButton({ link, className = "", text = "" }) {
  return (
    <Link 
      className={`
        relative px-8 py-4 rounded-full font-bold text-lg 
        bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]
        hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105 
        active:scale-95 transition-all duration-300 inline-block
        ${className}
      `} 
      href={link}
    >
      {text}
    </Link>
  );
}

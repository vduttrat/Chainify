import Image from "next/image";
import sample from "./sample.jpg"
import PageWrapper from "./components/pagewrapper";
import NavButton from "./components/navbutton";

export default function Home() {
  return (
    <PageWrapper className="space-y-6">
        <div className="absolute top-[25vh] left-[15vw] text-center flex flex-row space-x-[15vw]">
            <div className="my-auto">
                <h1 className="animate-in opacity-0 slide_in duration-600 text-6xl font-bold mb-4 italic fill-mode-forwards"> Chainify </h1>
                <p className="animate-in opacity-0 slide_in duration-600 text-2xl delay-600 italic mb-10 fill-mode-forwards"> Bringing your trust on-chain </p>
                <div className="animate-in opacity-0 slide_in duration-600 delay-1200 fill-mode-forwards">
                    <NavButton link="/discover" text="Get Started" />
                </div>
            </div>

                <Image src={sample} alt="" height="500" width="600" className="rounded-4xl"/>
        </div>
    </PageWrapper>
  );
}

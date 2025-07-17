import Image from "next/image";

export default function BgLogo() {
  return (
    <>
    
    <div className="fixed top-1/2 left-1/2  md:left-0 -translate-x-1/2 -translate-y-1/2 opacity-20">
      <Image src="/Images/logo.jpg" alt="logo" width={500} height={500} className="" />
    </div>
    <div className=" hidden md:block fixed top-1/2 right-0 translate-x-1/2 -translate-y-1/2 opacity-20">
      <Image src="/Images/logo.jpg" alt="logo" width={500} height={500} className="" />
    </div>

    </>
  )
}
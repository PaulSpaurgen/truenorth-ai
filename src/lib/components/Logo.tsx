import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex flex-row items-center mx-2 sm:mx-0">
      <Image src="/Images/star.png" alt="logo" width={48} height={48} className="h-6 sm:h-12 w-6 sm:w-12" />
      <p className="text-white text-md sm:text-3xl " style={{ fontFamily: 'var(--font-cormorant-garamond), sans-serif' }}>TrueNorth</p>
    </div>
  )
}

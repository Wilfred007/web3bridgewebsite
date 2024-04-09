import Image, { StaticImageData } from "next/image"


const Sponsor = ({ image }: { image: StaticImageData }) => {
    return (
        <div className="px-8 py-3">
            <Image src={image} className="h-14 w-32 object-contain" priority
                quality={100} alt="Sponsor" />
        </div>
    )
}

export default Sponsor
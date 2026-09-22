"useclient" 
import { useImages } from "@/app/(Context)/ImageProvider"

const WebtoonView=({currentIndex,scale,setScale}:{currentIndex:number
    ,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>
})=>{

    const { images }=useImages();
    return (
        <>웹툰
        <img src={images[currentIndex].url} />;
        </>
    )
}
export default WebtoonView;
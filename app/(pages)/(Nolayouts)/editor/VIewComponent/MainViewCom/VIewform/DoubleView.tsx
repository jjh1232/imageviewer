"useclient" 
import { useImages } from "@/app/(Context)/ImageProvider"

const DoubleView=({currentIndex,scale,setScale}:{currentIndex:number
    ,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>

})=>{

    const { images }=useImages();
    return (
        <>더블
        <img src={images[currentIndex].url} />;
        </>
    )
}

export default DoubleView;
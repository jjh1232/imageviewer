import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { createContext,useContext,ReactNode } from "react";

interface ImageItem{
    id:string;
    url:string;
    title:string;
    size:number;
    type:string;
}

interface ImageManager{
    //images:File[]; 파일자체보다 url이 가벼우니그렇게
    //setImages:Dispatch<SetStateAction<File[]>>;
    images:ImageItem[];
    addImages:(newImages:ImageItem[])=>void;
    removeImage:(id:string)=>void;
}
//context생성
const ImageContext=createContext<ImageManager | null>(null);

//프로파이더컴포넌트
export const ImageProvider=({children}:{children:ReactNode})=>{
    const [images,setImages]=useState<ImageItem[]>([]);

    //이미지추가
    const addImages=useCallback((newImages:ImageItem[])=>{
      setImages(prev=>[...prev,...newImages])
    },[])

    //삭제+메모리정리
    const removeImage=useCallback((id:string)=>{
      setImages(prev=>{
        const img=prev.find(i=>i.id===id);
        // blob: 일 때만 되돌린다. data: 는 되돌릴 대상이 없다.
        if (img?.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
        return prev.filter(i=>i.id !==id);
      })
    },[])

    //이미지닮기
    const value:ImageManager={images,addImages,removeImage};

    return (
        <ImageContext.Provider value={value} >
            {children}
        </ImageContext.Provider>
    )
}
//  편리한 훅 (어디서든 쓸 수 있게) 프로바이더체크
export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useFiles must be used within FileProvider');
  }
  return context;
};
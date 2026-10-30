import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import { createContext,useContext,ReactNode } from "react";
import type { ImageItem } from "@/app/(Tools)/UserImageManager";

interface ImageManager{
    //images:File[]; 파일자체보다 url이 가벼우니그렇게
    //setImages:Dispatch<SetStateAction<File[]>>;
    images:ImageItem[];
    addImages:(newImages:ImageItem[])=>void;
    insertImages:(newImages:ImageItem[],rankOf:(id:string)=>number|undefined)=>void;
    clearCount:()=>number;
    removeImage:(id:string)=>void;
    removeImages:(ids:string[])=>void;
    clearImages:()=>void;
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

    /*
     * 한 번의 불러오기 안에서 순서(rank) 자리에 끼워 넣는다. 주소 불러오기는 열리는 대로 넣는데,
     * 한 번 안 열려 다시 본 장은 뒤 번호보다 늦게 들어온다(UrlSequence loadOpening).
     * rankOf 는 그 불러오기의 장만 값을 준다 — 다른 장(따로 연 파일 등)은 건너뛴다.
     * 뒤 번호가 아직 없으면 그 불러오기의 마지막 장 바로 뒤, 그것도 없으면 맨 끝.
     */
    const insertImages=useCallback((newImages:ImageItem[],rankOf:(id:string)=>number|undefined)=>{
      setImages(prev=>{
        const out=[...prev];
        for(const img of newImages){
          const r=rankOf(img.id)!;
          let at=out.findIndex(p=>{ const pr=rankOf(p.id); return pr!==undefined && pr>r; });
          if(at<0){
            const last=out.findLastIndex(p=>rankOf(p.id)!==undefined);
            at=last<0 ? out.length : last+1;
          }
          out.splice(at,0,img);
        }
        return out;
      })
    },[])

    // 비우기 횟수. 진행 중인 주소 불러오기가 비운 뒤에 다시 채우지 않게 이걸로 본다.
    const cleared=useRef(0);
    const clearCount=useCallback(()=>cleared.current,[]);

    //삭제+메모리정리
    const removeImage=useCallback((id:string)=>{
      setImages(prev=>{
        const img=prev.find(i=>i.id===id);
        // blob: 일 때만 되돌린다. data: 는 되돌릴 대상이 없다.
        if (img?.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
        return prev.filter(i=>i.id !==id);
      })
    },[])

    // 여러 장을 한 번에 — 한 장씩 빼면 그때마다 다시 그린다.
    const removeImages=useCallback((ids:string[])=>{
      if(ids.length===0) return;
      const drop=new Set(ids);
      setImages(prev=>prev.filter(i=>!drop.has(i.id)));
    },[])

    // 전부 비우기(위 막대 「비우기」). blob: 은 되돌려 메모리를 푼다.
    const clearImages=useCallback(()=>{
      cleared.current++;
      setImages(prev=>{
        for(const i of prev) if(i.url.startsWith("blob:")) URL.revokeObjectURL(i.url);
        return [];
      })
    },[])

    //이미지닮기
    const value:ImageManager={images,addImages,insertImages,clearCount,removeImage,removeImages,clearImages};

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
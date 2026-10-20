"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import React, { useEffect, useRef } from "react"
import SingleView from "./VIewform/SingleView";
import DoubleView from "./VIewform/DoubleView";
import WebtoonView from "./VIewform/WebtoonView";
import styled from "styled-components";
import { Whellmove } from "@/app/(Tools)/ViewMouseController";
import { clampScale, setZoomAnchor } from "./VIewform/useFit";

const Empty=styled.p`
    margin: auto;
    color: #8a919c;
    font-size: 14px;
`

const Wrapper=styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    min-height: 0;
`

export default function MainViewer({
    Currentnumber,setCurrentnumber,viewmode,scale,setScale,fit,onFitRatio}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>,
        fit:boolean,onFitRatio:(r:number)=>void
    }
){

    const {images}=useImages(); //id,url,title,type,size
    const totalimages=images.length;
    const isempty=totalimages===0;

    

    /*
     * 휠. React 의 onWheel 은 passive 라 preventDefault 가 안 먹어서(Ctrl+휠이 브라우저 확대로 새 버린다)
     * 직접 붙인다.
     *  - Ctrl+휠: 커서 자리를 기준으로 확대·축소. 한 칸에 1.1배.
     *  - 웹툰형: 그냥 스크롤.
     *  - 한 장·두 장: 사진이 넘쳐서 그 방향으로 더 갈 데가 있으면 스크롤, 끝에 닿았으면 넘기기.
     *    확대해 놓고 굴렸더니 다음 장으로 튀면 아래쪽을 볼 수가 없다.
     */
    const area=useRef<HTMLDivElement>(null);
    useEffect(()=>{
        const el=area.current;
        if(!el) return;
        const onWheel=(e:WheelEvent)=>{
            if(e.ctrlKey||e.metaKey){
                e.preventDefault();
                setZoomAnchor({x:e.clientX,y:e.clientY});
                setScale(s=>clampScale(s*(e.deltaY<0?1.1:1/1.1)));
                return;
            }
            if(viewmode==="webtoon") return;
            const sc=(e.target as HTMLElement).closest<HTMLElement>("[data-scroller]");
            if(sc){
                const vertical=Math.abs(e.deltaY)>=Math.abs(e.deltaX);
                const d=vertical?e.deltaY:e.deltaX;
                const pos=vertical?sc.scrollTop:sc.scrollLeft;
                const max=vertical?sc.scrollHeight-sc.clientHeight:sc.scrollWidth-sc.clientWidth;
                if(max>1 && (d>0 ? pos<max-1 : pos>1)) return;   // 아직 스크롤할 자리가 있다
            }
            Whellmove(e as unknown as React.WheelEvent,setCurrentnumber,totalimages,viewmode==="double"?2:1);
        };
        el.addEventListener("wheel",onWheel,{passive:false});
        return ()=>el.removeEventListener("wheel",onWheel);
    },[viewmode,totalimages,setCurrentnumber,setScale]);

    // ← → 로 넘긴다. 두 장 펼침이면 두 장씩, 끝에서는 멈춘다(휠과 같은 규칙).
    useEffect(()=>{
        const onKey=(e:KeyboardEvent)=>{
            const t=e.target as HTMLElement;
            if(t.closest("input, textarea, [contenteditable='true']")) return;
            if(e.ctrlKey||e.metaKey||e.altKey||totalimages===0) return;
            const step=viewmode==="double"?2:1;
            if(e.key==="ArrowRight"){ e.preventDefault(); setCurrentnumber(p=>Math.min(totalimages-1,p+step)); }
            else if(e.key==="ArrowLeft"){ e.preventDefault(); setCurrentnumber(p=>Math.max(0,p-step)); }
        };
        document.addEventListener("keydown",onKey);
        return ()=>document.removeEventListener("keydown",onKey);
    },[viewmode,totalimages,setCurrentnumber]);

    const Viewmoderender=()=>{
        switch(viewmode){
            case "webtoon": return <WebtoonView currentIndex={Currentnumber} setCurrentIndex={setCurrentnumber} scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio} />
            case "double": return <DoubleView currentIndex={Currentnumber} scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio}/>
            default: return <SingleView currentIndex={Currentnumber} scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio}/>
        }
    }
    return (
        <Wrapper ref={area}>
        {isempty
            ? <Empty>위에서 파일이나 주소로 이미지를 불러오세요.</Empty>
            : Viewmoderender()
        }
    
           
        </Wrapper>
    )
} 
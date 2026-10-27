"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import { useLang } from "@/i18n/EditorLang"
import React, { useCallback, useEffect, useRef } from "react"
import SingleView from "./VIewform/SingleView";
import DoubleView from "./VIewform/DoubleView";
import WebtoonView from "./VIewform/WebtoonView";
import GridView from "./VIewform/GridView";
import styled from "styled-components";
import { Whellmove } from "@/app/(Tools)/ViewMouseController";
import { clampScale, setZoomAnchor } from "./VIewform/useFit";

const Empty=styled.p`
    margin: auto;
    color: var(--muted);
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

/*
 * 양옆 < > . 사진 위에 떠 있으므로 평소엔 흐리게, 마우스를 올리면 진하게.
 * hover 가 없는 터치 기기는 처음부터 보이게 둔다.
 * 끝에 닿은 쪽은 disabled 로 숨긴다 — 자리는 남아 있어 눌러도 아무 일도 없다.
 */
const Side=styled.button<{$side:"left"|"right"}>`
    position: absolute;
    top: 50%;
    ${p=>p.$side==="left"?"left: 10px;":"right: 18px;"}
    transform: translateY(-50%);
    z-index: 2;
    display: grid;
    place-items: center;
    width: 40px;
    height: 64px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--bg);
    color: var(--text);
    box-shadow: 0 2px 8px var(--shadow);
    cursor: pointer;
    opacity: 0;
    transition: opacity .15s;
    ${Wrapper}:hover & { opacity: .55; }
    &:hover, &:focus-visible { opacity: 1; }
    @media (hover: none) { opacity: .55; }
    &:disabled { visibility: hidden; }
`

export default function MainViewer({
    Currentnumber,setCurrentnumber,viewmode,scale,setScale,fit,onFitRatio,onPick,gridOpen,onOpenGroup}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>,
        fit:boolean,onFitRatio:(r:number)=>void,onPick:(i:number)=>void,
        gridOpen:string|null,onOpenGroup:(g:string|null)=>void
    }
){

    const {images}=useImages(); //id,url,title,type,size
    const {t}=useLang();
    const totalimages=images.length;
    const isempty=totalimages===0;

    /*
     * 보던 장을 번호가 아니라 사진으로 붙잡는다. 주소 불러오기는 넣은 뒤에 뒤에서 빈 번호를 빼므로
     * (UrlSequence 「먼저 넣고, 뒤에서 뺀다」) 앞쪽이 빠지면 같은 번호가 다른 사진이 된다.
     * 목록이 바뀌었을 때만 옮긴다 — 넘겨서 번호가 바뀐 것까지 되돌리면 안 된다.
     */
    const viewing=useRef<string|undefined>(undefined);
    const seen=useRef(images);
    useEffect(()=>{
        if(seen.current!==images){
            seen.current=images;
            const at=images.findIndex(i=>i.id===viewing.current);
            if(at>=0 && at!==Currentnumber){ setCurrentnumber(at); return; }
            if(at<0 && Currentnumber>=images.length && images.length>0){ setCurrentnumber(images.length-1); return; }
        }
        viewing.current=images[Currentnumber]?.id;
    },[images,Currentnumber,setCurrentnumber]);

    

    /*
     * 휠. React 의 onWheel 은 passive 라 preventDefault 가 안 먹어서(Ctrl+휠이 브라우저 확대로 새 버린다)
     * 직접 붙인다.
     *  - Ctrl+휠: 커서 자리를 기준으로 확대·축소. 한 칸에 1.1배.
     *  - 목록: 아무것도 안 한다 — 그냥 스크롤. 확대할 사진이 없다.
     *  - 웹툰형: 그냥 스크롤.
     *  - 한 장·두 장: 사진이 넘쳐서 그 방향으로 더 갈 데가 있으면 스크롤, 끝에 닿았으면 넘기기.
     *    확대해 놓고 굴렸더니 다음 장으로 튀면 아래쪽을 볼 수가 없다.
     */
    const area=useRef<HTMLDivElement>(null);
    useEffect(()=>{
        const el=area.current;
        if(!el) return;
        const onWheel=(e:WheelEvent)=>{
            if(viewmode==="grid") return;
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

    // 넘기기. 두 장 펼침이면 두 장씩, 끝에서는 멈춘다(휠과 같은 규칙). ← → 와 양옆 버튼이 같이 쓴다.
    const step=viewmode==="double"?2:1;
    const go=useCallback((dir:1|-1)=>{
        setCurrentnumber(p=>Math.max(0,Math.min(totalimages-1,p+dir*step)));
    },[totalimages,step,setCurrentnumber]);

    useEffect(()=>{
        const onKey=(e:KeyboardEvent)=>{
            const t=e.target as HTMLElement;
            if(t.closest("input, textarea, [contenteditable='true']")) return;
            if(e.ctrlKey||e.metaKey||e.altKey||totalimages===0||viewmode==="grid") return;
            if(e.key==="ArrowRight"){ e.preventDefault(); go(1); }
            else if(e.key==="ArrowLeft"){ e.preventDefault(); go(-1); }
        };
        document.addEventListener("keydown",onKey);
        return ()=>document.removeEventListener("keydown",onKey);
    },[viewmode,totalimages,go]);

    // 버튼은 한 장·두 장 보기에서만. 웹툰형은 스크롤이 넘기기고, 목록은 넘길 장이 없다.
    const showSides=!isempty && (viewmode==="single"||viewmode==="double");

    const Viewmoderender=()=>{
        switch(viewmode){
            case "grid": return <GridView currentIndex={Currentnumber} onPick={onPick} openId={gridOpen} onOpenGroup={onOpenGroup} />
            case "webtoon": return <WebtoonView currentIndex={Currentnumber} setCurrentIndex={setCurrentnumber} scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio} />
            case "double": return <DoubleView currentIndex={Currentnumber} scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio}/>
            default: return <SingleView currentIndex={Currentnumber} scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio}/>
        }
    }
    return (
        <Wrapper ref={area}>
        {isempty
            ? <Empty>{t.emptyViewer}</Empty>
            : Viewmoderender()
        }
        {showSides && <>
            <Side type="button" $side="left" aria-label={t.prevPage} title={`${t.prevPage} (←)`}
                disabled={Currentnumber<=0} onClick={()=>go(-1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            </Side>
            <Side type="button" $side="right" aria-label={t.nextPage} title={`${t.nextPage} (→)`}
                disabled={Currentnumber>=totalimages-1} onClick={()=>go(1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </Side>
        </>}
    
           
        </Wrapper>
    )
} 
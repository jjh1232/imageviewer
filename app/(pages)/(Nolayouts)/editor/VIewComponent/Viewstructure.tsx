"use client"
import styled from "styled-components"
import ViewTop from "./ViewTop"
import MainView from "./MainView"
import ViewBottom from "./ViewBottom"
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import {  ImageProvider, useImages } from "@/app/(Context)/ImageProvider"
import type { ImageItem } from "@/app/(Tools)/UserImageManager"
import { clampScale } from "./MainViewCom/VIewform/useFit"
import { useJumpHistory, type Mode } from "./useJumpHistory"

const Wrapper=styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;           /* 위·아래 막대는 고정, 가운데만 스크롤 */
   // border: 4px solid red;
    z-index: 100;

    //여기스크롤이생김
`

/** 이 칸은 ImageProvider 바깥이라 사진 목록을 못 본다. 안쪽에서 ref 로 넘겨 준다(뒤로가기가 id 로 장을 찾는다). */
function ImagesBridge({ onChange }: { onChange: (images: ImageItem[]) => void }) {
    const { images } = useImages();
    useEffect(() => { onChange(images); }, [images, onChange]);
    return null;
}

/*
 * 크기: 100% = 원본, 「맞춤」 = 영역에 꽉(useFit.ts 머리말).
 * 아래 막대 오른쪽 끝 「맞춤」 버튼과 F 키가 맞춤을 켠다. 처음 열 때도 맞춤이다.
 * 뒤로가기: 건너뛰기만 기록한다(useJumpHistory.ts 머리말).
 */
export default function Viewstructure(){

    const [Currentnumber,setCurrentnumber]=useState(0);
    const [viewmode,setViewmode]=useState<Mode>("single");
    const [gridOpen,setGridOpen]=useState<string|null>(null);   // 목록에서 열어 둔 묶음
    const imagesRef=useRef<ImageItem[]>([]);
    const keepImages=useCallback((list:ImageItem[])=>{ imagesRef.current=list; },[]);

    const { jump, back, canBack } = useJumpHistory({
        mode: viewmode, setMode: setViewmode,
        index: Currentnumber, setIndex: setCurrentnumber,
        gridOpen, setGridOpen,
        images: imagesRef,
    });

    // 목록에서 한 장을 누르면 목록에 오기 전에 보던 모드로 간다.
    const readMode=useRef<Exclude<Mode,"grid">>("single");
    useEffect(()=>{ if(viewmode!=="grid") readMode.current=viewmode; },[viewmode]);
    const pickFromGrid=useCallback((i:number)=>jump({ mode: readMode.current, index: i }),[jump]);
    const openGroup=useCallback((g:string|null)=>jump({ gridOpen: g }),[jump]);
    const jumpTo=useCallback((i:number)=>jump({ index: i }),[jump]);
    // 위 탭
    const chooseMode=useCallback<Dispatch<SetStateAction<Mode>>>((v)=>{
        jump({ mode: typeof v==="function" ? v(viewmode) : v });
    },[jump,viewmode]);

    const [fit,setFit]=useState(true);
    const [manual,setManual]=useState(1);       // 맞춤을 푼 뒤의 배율(원본 대비)
    const [fitRatio,setFitRatio]=useState(1);   // 지금 장을 맞춤했을 때의 배율 — 보기가 알려 준다
    const scale = fit ? fitRatio : manual;      // 화면에 보이는 배율
    const scaleRef=useRef(scale); scaleRef.current=scale;

    // 값이든 (지금 배율)=>새 배율 이든 받는다. 어느 쪽이든 맞춤은 풀린다.
    const setScale=useCallback<Dispatch<SetStateAction<number>>>((v)=>{
        const next = typeof v==="function" ? v(scaleRef.current) : v;
        setFit(false);
        setManual(clampScale(next));
    },[]);
    const fitToArea=useCallback(()=>setFit(true),[]);

    // 비운 뒤 다음에 불러오면 첫 장부터. 목록에서 열어 둔 묶음도 닫는다.
    const cleared=useCallback(()=>{ setCurrentnumber(0); setGridOpen(null); },[]);

    // 왼쪽 파일 목록. 여닫는 버튼은 위 막대 맨 왼쪽에 있다.
    const [sideOpen,setSideOpen]=useState(true);
    const toggleSide=useCallback(()=>setSideOpen(o=>!o),[]);

    // F · L · Esc. ← → 는 장 수를 아는 MainViewer 가 맡는다(이 칸은 ImageProvider 바깥이다).
    // 주소창 같은 입력칸에 글을 쓰는 중이면 손대지 않는다.
    useEffect(()=>{
        const onKey=(e:KeyboardEvent)=>{
            const t=e.target as HTMLElement;
            if(t.closest("input, textarea, [contenteditable='true']")) return;
            if(e.ctrlKey||e.metaKey||e.altKey) return;
            // key 가 아니라 code 로 본다 — 한글 입력 상태면 key 가 「ㄹ」「ㅣ」 로 온다.
            if(e.code==="KeyF"){ e.preventDefault(); fitToArea(); }
            if(e.code==="KeyL"){ e.preventDefault(); toggleSide(); }
            // Esc = 뒤로가기. 뷰어 안에서 쌓은 기록이 없으면 아무것도 안 한다(페이지를 떠나지 않게).
            if(e.key==="Escape" && back()) e.preventDefault();
        };
        document.addEventListener("keydown",onKey);
        return ()=>document.removeEventListener("keydown",onKey);
    },[fitToArea,toggleSide,back]);

    return (
        <Wrapper>
            {/* 탑*/}
            <ImageProvider >
            <ImagesBridge onChange={keepImages}/>
            <ViewTop viewmode={viewmode} setViewmode={chooseMode} onBack={back} canBack={canBack} sideOpen={sideOpen} onToggleSide={toggleSide}
                onCleared={cleared}/>
             {/* 메인*/}
             <MainView Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} onJump={jumpTo}
             viewmode={viewmode} scale={scale} setScale={setScale}
             fit={fit} onFitRatio={setFitRatio} onPick={pickFromGrid}
             gridOpen={gridOpen} onOpenGroup={openGroup} sideOpen={sideOpen}
             />
        {/* 바텀*/}
         <ViewBottom Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} viewmode={viewmode} scale={scale} setScale={setScale}
             fit={fit} onFit={fitToArea}/>
        </ImageProvider>
        </Wrapper>
    )
}

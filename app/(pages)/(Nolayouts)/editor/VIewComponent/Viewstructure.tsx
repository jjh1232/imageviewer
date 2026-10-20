"use client"
import styled from "styled-components"
import ViewTop from "./ViewTop"
import MainView from "./MainView"
import ViewBottom from "./ViewBottom"
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import {  ImageProvider } from "@/app/(Context)/ImageProvider"
import { clampScale } from "./MainViewCom/VIewform/useFit"

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
/*
 * 크기: 100% = 원본, 「맞춤」 = 영역에 꽉(useFit.ts 머리말).
 * 아래 막대 오른쪽 끝 「맞춤」 버튼과 F 키가 맞춤을 켠다. 처음 열 때도 맞춤이다.
 */
export default function Viewstructure(){

    const [Currentnumber,setCurrentnumber]=useState(0);
    const [viewmode,setViewmode]=useState<"single"|"double"|"webtoon">("single");
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

    // F. ← → 는 장 수를 아는 MainViewer 가 맡는다(이 칸은 ImageProvider 바깥이다).
    // 주소창 같은 입력칸에 글을 쓰는 중이면 손대지 않는다.
    useEffect(()=>{
        const onKey=(e:KeyboardEvent)=>{
            const t=e.target as HTMLElement;
            if(t.closest("input, textarea, [contenteditable='true']")) return;
            if(e.ctrlKey||e.metaKey||e.altKey) return;
            if(e.key==="f"||e.key==="F"){ e.preventDefault(); fitToArea(); }
        };
        document.addEventListener("keydown",onKey);
        return ()=>document.removeEventListener("keydown",onKey);
    },[fitToArea]);

    return (
        <Wrapper>
            {/* 탑*/}
            <ImageProvider >
            <ViewTop viewmode={viewmode} setViewmode={setViewmode}/>
             {/* 메인*/}
             <MainView Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber}
             viewmode={viewmode} scale={scale} setScale={setScale}
             fit={fit} onFitRatio={setFitRatio}
             />
        {/* 바텀*/}
         <ViewBottom Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} viewmode={viewmode} scale={scale} setScale={setScale}
             fit={fit} onFit={fitToArea}/>    
        </ImageProvider>
        </Wrapper>
    )
}
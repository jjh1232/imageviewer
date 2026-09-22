"use client"
import styled from "styled-components"
import ViewTop from "./ViewTop"
import MainView from "./MainView"
import ViewBottom from "./ViewBottom"
import { useState } from "react"
import {  ImageProvider } from "@/app/(Context)/ImageProvider"

const Wrapper=styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
   // border: 4px solid red;
    z-index: 100;
   
    //여기스크롤이생김
`
export default function Viewstructure(){

    const [Currentnumber,setCurrentnumber]=useState(0);
    const [viewmode,setViewmode]=useState<"single"|"double"|"webtoon">("single");
    const [scale,setScale]=useState(1);
    return (
        <Wrapper>
            {/* 탑*/}
            <ImageProvider >
            <ViewTop viewmode={viewmode} setViewmode={setViewmode} scale={scale} setScale={setScale}/>
             {/* 메인*/}
             <MainView Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber}
             viewmode={viewmode} scale={scale} setScale={setScale}
             />
        {/* 바텀*/}
         <ViewBottom Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} viewmode={viewmode}/>    
        </ImageProvider>
        </Wrapper>
    )
}
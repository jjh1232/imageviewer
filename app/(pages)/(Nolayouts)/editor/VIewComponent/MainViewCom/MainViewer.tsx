"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import React, { useState } from "react"
import SingleView from "./VIewform/SingleView";
import DoubleView from "./VIewform/DoubleView";
import WebtoonView from "./VIewform/WebtoonView";
import styled from "styled-components";
import { Whellmove } from "@/app/(Tools)/ViewMouseController";

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
    Currentnumber,setCurrentnumber,viewmode,scale,setScale}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>
    }
){

    const {images}=useImages(); //id,url,title,type,size
    const totalimages=images.length;
    const isempty=totalimages===0;

    

    const Viewmoderender=()=>{
        switch(viewmode){
            case "webtoon": return <WebtoonView currentIndex={Currentnumber} scale={scale} setScale={setScale} />
            case "double": return <DoubleView currentIndex={Currentnumber} scale={scale} setScale={setScale}/>
            default: return <SingleView currentIndex={Currentnumber} scale={scale} setScale={setScale}/>
        }
    }
    return (
        <Wrapper onWheel={(e)=>Whellmove(e,setCurrentnumber,totalimages)}>
        {isempty
            ? <Empty>왼쪽에서 이미지를 고르거나 끌어다 놓으세요.</Empty>
            : Viewmoderender()
        }
    
           
        </Wrapper>
    )
} 
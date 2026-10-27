"use client"
import styled from "styled-components"
import LeftMain from "./SideComponent/LeftMain"
import React, { Dispatch, SetStateAction, useCallback } from "react"
import { useImages } from "@/app/(Context)/ImageProvider"
import { UserImageManager } from "@/app/(Tools)/UserImageManager"

const Wrapper=styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-height: 0;              /* 안쪽 목록이 스크롤되려면 필요하다 */
    top: 0px;
    z-index: 10;
    border-right: 1px solid var(--line);
    background: var(--bg-side);
`


export default function Leftsidebar({
    Currentnumber,setCurrentnumber,onJump}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>;onJump:(i:number)=>void}
){

    const {images,addImages}=useImages();
    const {inputimages}=UserImageManager();
    const handleDragover=useCallback((e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();//드롭가능하게
    },[])
    const handlerDrop=useCallback(async (e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        const file=Array.from(e.dataTransfer.files);

        // 거르기는 inputimages 안에서 한다. 여기서 또 하면 두 곳이 어긋난다.
        addImages(await inputimages(file));
    },[addImages,inputimages]) //이함수를 쓴다는걸 나타내는겸 또는 분기나조건마다 함수가 변경될수도있음
    return (<Wrapper onDragOver={handleDragover} onDrop={handlerDrop}>
             {/*메인박스*/}   
            <LeftMain Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} onJump={onJump}/>
    </Wrapper>)
}
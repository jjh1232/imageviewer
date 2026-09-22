"use client"
import { useImages } from "@/app/(Context)/ImageProvider";
import { useState } from "react";
import styled from "styled-components"

const Wrapper=styled.div`
    position: sticky;
    bottom: 0;
    border: 1px solid blue;
    height: 35px;
    display: flex;
    justify-content: center;
    background-color: white;
`



export default function ViewBottom({
    Currentnumber,setCurrentnumber,viewmode}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string
    }

){

    const {images}=useImages();
    const total=images.length;

    //렌더링용
    const DisplayNumber=()=>{
        if(viewmode==="double"){
            const start=Currentnumber+1;
            const end=Math.min(start+1,total);
            if(start===end || total===1){
                return <>{start}/{total}</>
            }
            return (<>{start}-{end}/{total}</>)
        }
        return <>{Currentnumber+1}/{total}</>
    }
    return (<Wrapper>
    <div onClick={()=>setCurrentnumber(prev=>
        prev===0?total-1:prev-1)}>
    뒤로
    </div>
    <>{DisplayNumber()}</>
    <div onClick={()=>setCurrentnumber(prev=>prev===total-1?0:prev+1)}>
    앞으로
    </div>
    
    </Wrapper>)
}
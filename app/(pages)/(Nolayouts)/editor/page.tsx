"use client"
import styled from "styled-components";
import { useState } from "react";
import Viewstructure from "./VIewComponent/Viewstructure";




const Wrapper=styled.div`
width: 100%;
height: 100vh;
    display: flex;
   
`


export default function ViewPage(){
    const [mode,setMode]=useState<"view"|"editor">("view");
    

    return (<Wrapper>
        <Viewstructure />
    </Wrapper>
    
)
}
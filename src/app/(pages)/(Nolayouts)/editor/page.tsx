"use client"
import styled from "styled-components";
import Viewstructure from "./VIewComponent/Viewstructure";
import { EditorLangProvider } from "@/i18n/EditorLang";




const Wrapper=styled.div`
width: 100%;
height: 100vh;
    display: flex;
   
`


export default function ViewPage(){
    

    return (<Wrapper>
        <EditorLangProvider><Viewstructure /></EditorLangProvider>
    </Wrapper>
    
)
}
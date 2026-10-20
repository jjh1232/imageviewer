"use client"
import styled from "styled-components"
import { useImages } from "@/app/(Context)/ImageProvider"
import { UserImageManager } from "@/app/(Tools)/UserImageManager"
import UrlBar from "./TopComponent/UrlBar"

/* 위: 불러오기(파일 · 주소)와 보기 모드. 확대는 아래 넘기기 사이로 옮겼다. */
const Wrapper=styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid #e6e9ee;
    background-color: #fff;
    z-index: 10;
`
const HiddenFileInput = styled.input.attrs({ type: "file", accept: "image/*", multiple: true })`
    display: none;
`
const FileButton = styled.label`
    flex-shrink: 0;
    height: 32px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    border: 1px solid #d5dae1;
    border-radius: 6px;
    background: #fff;
    color: #1f2937;
    font-size: 13px;
    cursor: pointer;

    &:hover { background: #f3f4f6; }
`
/* 세 칸짜리 토글. 지금 모드가 눌려 있다. */
const Modes=styled.div`
    flex-shrink: 0;
    display: flex;
    height: 32px;
    padding: 2px;
    border-radius: 7px;
    background: #f0f2f5;
`
const Mode=styled.button<{ $on: boolean }>`
    padding: 0 12px;
    border: none;
    border-radius: 5px;
    background: ${({ $on }) => ($on ? "#fff" : "transparent")};
    box-shadow: ${({ $on }) => ($on ? "0 1px 2px rgba(0,0,0,.12)" : "none")};
    color: ${({ $on }) => ($on ? "#1f2937" : "#8a919c")};
    font-size: 13px;
    cursor: pointer;
`

type ViewModes = "single"|"double"|"webtoon" //유니온타입은string안되네

const modes=[
    {key:"single" as ViewModes,label:"싱글"},
    {key:"double" as ViewModes,label:"더블"},
    {key:"webtoon" as ViewModes,label:"웹툰"}
]

export default function ViewTop({
    viewmode,setViewmode}:
    {viewmode:string,setViewmode:React.Dispatch<React.SetStateAction<ViewModes>>}
){
    const {addImages}=useImages();
    const {inputimages}=UserImageManager();

    const handleFiles=async (e:React.ChangeEvent<HTMLInputElement>)=>{
        if(!e.target.files) return;
        addImages(await inputimages(Array.from(e.target.files)));
        e.target.value='';//같은 파일을 다시 골라도 onChange 가 돌게
    }

    return (<Wrapper>
        <FileButton htmlFor="inputbutton">파일 열기</FileButton>
        <HiddenFileInput id="inputbutton" onChange={handleFiles}/>

        <UrlBar />

        <Modes>
            {modes.map(({key,label})=>(
                <Mode key={key} type="button" $on={viewmode===key} onClick={()=>setViewmode(key)}>
                    {label}
                </Mode>
            ))}
        </Modes>
    </Wrapper>)
}

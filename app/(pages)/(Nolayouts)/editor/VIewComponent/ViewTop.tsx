"use client"
import styled from "styled-components"
import { useImages } from "@/app/(Context)/ImageProvider"
import { UserImageManager } from "@/app/(Tools)/UserImageManager"
import UrlBar from "./TopComponent/UrlBar"
import { useEffect, useRef, useState } from "react"

/* 위: 불러오기(파일 · 주소)와 보기 모드. 확대는 아래 넘기기 사이로 옮겼다.
   **한 줄로 고정한다.** 주소 불러오기는 조건 줄이 늘어나면 막대가 두세 줄로 불어나 보기 영역을
   갉아먹어서, 버튼을 누르면 아래로 펼쳐지는 패널로 뺐다(UrlMenu). */
const Wrapper=styled.div`
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid #e6e9ee;
    background-color: #fff;
    z-index: 60;            /* 펼친 패널이 왼쪽 목록(z 10)·리사이저(z 20) 위로 와야 한다 */
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
/* 주소로 불러오기 버튼과 그 아래 펼쳐지는 패널. */
const UrlButton = styled.button<{ $open: boolean }>`
    flex-shrink: 0;
    height: 32px;
    padding: 0 14px;
    border: 1px solid ${({ $open }) => ($open ? "#4f46e5" : "#d5dae1")};
    border-radius: 6px;
    background: ${({ $open }) => ($open ? "#eef2ff" : "#fff")};
    color: ${({ $open }) => ($open ? "#4f46e5" : "#1f2937")};
    font-size: 13px;
    cursor: pointer;
    &:hover { background: ${({ $open }) => ($open ? "#eef2ff" : "#f3f4f6")}; }
`
/* 화면 전체를 가리는 창이 아니라 버튼 아래 패널 — 뒤의 사진이 보인 채로 조건을 고친다. */
const Panel = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 12px;
    width: min(720px, calc(100vw - 24px));
    padding: 14px;
    border: 1px solid #e6e9ee;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 12px 32px rgba(15, 23, 42, .14);
    z-index: 50;
`
const PanelTitle = styled.div`
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
`
const Spacer = styled.div`flex: 1;`
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

        <UrlMenu />
        <Spacer />

        <Modes>
            {modes.map(({key,label})=>(
                <Mode key={key} type="button" $on={viewmode===key} onClick={()=>setViewmode(key)}>
                    {label}
                </Mode>
            ))}
        </Modes>
    </Wrapper>)
}

/*
 * 주소로 불러오기 메뉴. 패널은 닫혀도 UrlBar 를 지우지 않고 숨기기만 한다 —
 * 다시 열면 마지막 주소·조건이 그대로 있어서 범위만 바꿔 또 불러올 수 있다.
 * 닫히는 때: 불러오기가 끝나 사진이 들어왔을 때 · Esc · 패널 바깥을 눌렀을 때.
 */
function UrlMenu() {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        // 열자마자 주소 칸에 커서
        box.current?.querySelector<HTMLInputElement>("input")?.focus();
        const onDown = (e: PointerEvent) => {
            if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div ref={box}>
            <UrlButton type="button" $open={open} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                주소로 불러오기
            </UrlButton>
            <Panel hidden={!open} role="dialog" aria-label="주소로 불러오기">
                <PanelTitle>주소로 불러오기</PanelTitle>
                <UrlBar onLoaded={() => setOpen(false)} />
            </Panel>
        </div>
    );
}

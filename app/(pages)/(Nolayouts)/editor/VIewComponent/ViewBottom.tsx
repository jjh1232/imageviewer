"use client"
import { useImages } from "@/app/(Context)/ImageProvider";
import { useState } from "react";
import { clampScale, MIN_SCALE, MAX_SCALE } from "./MainViewCom/VIewform/useFit";
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleMinus as minusicon, faCirclePlus as plusicon, faChevronLeft, faChevronRight, faExpand } from "@fortawesome/free-solid-svg-icons"

/* 아래: ◀ 이전 · 3 / 120 · 확대 · 다음 ▶ — 넘기기와 크기를 한 손 자리에 모은다. */
const Wrapper=styled.div`
    position: relative;
    flex-shrink: 0;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    border-top: 1px solid #e6e9ee;
    background-color: #fff;
    font-size: 13px;
    color: #1f2937;
`
/* 오른쪽 끝에 붙는다. 넘기기·확대 묶음은 가운데에 그대로 둔다. */
const FullButton=styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    height: 30px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #d5dae1;
    border-radius: 6px;
    background: #fff;
    color: inherit;
    font-size: 13px;
    cursor: pointer;
    &:hover { background: #f3f4f6; }
    &[aria-pressed="true"] { background: #eef2ff; border-color: #4f46e5; color: #4f46e5; }
`
const NavButton=styled.button`
    height: 30px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #d5dae1;
    border-radius: 6px;
    background: #fff;
    color: inherit;
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) { background: #f3f4f6; }
    &:disabled { opacity: .4; cursor: default; }
`
const Page=styled.span`
    min-width: 64px;
    text-align: center;
    font-variant-numeric: tabular-nums;
`
const Divider=styled.span`
    width: 1px;
    height: 18px;
    background: #e6e9ee;
`
const Zoom=styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8a919c;

    button {
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        font-size: 15px;
        cursor: pointer;
    }
    button:hover { color: #4f46e5; }
    input { width: 110px; accent-color: #4f46e5; }
`
/* 눌러서 숫자를 바로 쓴다. Enter·칸 밖 클릭이면 적용, Esc 면 취소. */
const Percent=styled.label`
    display: flex;
    align-items: center;
    gap: 1px;
    color: #1f2937;
    font-variant-numeric: tabular-nums;

    input {
        width: 44px;
        height: 26px;
        padding: 0 4px;
        border: 1px solid transparent;
        border-radius: 5px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: right;
        accent-color: auto;
    }
    input:hover { border-color: #d5dae1; }
    input:focus { outline: none; border-color: #4f46e5; background: #fff; }
`


export default function ViewBottom({
    Currentnumber,setCurrentnumber,viewmode,scale,setScale,fit,onFit}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>,
        fit:boolean,onFit:()=>void
    }
){
    const {images}=useImages();
    const total=images.length;
    const displayScale = Math.round(scale * 100);

    //렌더링용
    const pageLabel=()=>{
        if(total===0) return "0 / 0";
        if(viewmode==="double"){
            const start=Currentnumber+1;
            const end=Math.min(start+1,total);
            return start===end ? `${start} / ${total}` : `${start}-${end} / ${total}`;
        }
        return `${Currentnumber+1} / ${total}`;
    }

    // 두 장 펼침은 두 장씩 넘긴다. 끝에서 넘기면 반대쪽 끝으로 돈다(예전 동작 그대로).
    const step = viewmode==="double" ? 2 : 1;
    const prev = ()=>setCurrentnumber(p=> p-step < 0 ? Math.max(0, total-step) : p-step);
    const next = ()=>setCurrentnumber(p=> p+step > total-1 ? 0 : p+step);

    // 곱으로 움직인다. 10% 에서 800% 까지를 더하기로 오가면 끝이 안 난다.
    const zoomBy=(factor:number)=>setScale(before=>clampScale(before*factor));

    // 입력 중인 글자. null 이면 지금 배율을 보여 준다.
    const [draft,setDraft]=useState<string|null>(null);
    const commit=()=>{
        if(draft!==null){
            const n=parseInt(draft,10);
            if(!Number.isNaN(n)) setScale(clampScale(n/100));
        }
        setDraft(null);
    };

    return (<Wrapper>
        <NavButton type="button" disabled={total===0}
            onClick={prev}>
            <FontAwesomeIcon icon={faChevronLeft}/> 이전
        </NavButton>

        <Page>{pageLabel()}</Page>
        <Divider />

        <Zoom>
            <button type="button" aria-label="작게" onClick={()=>zoomBy(1/1.2)}><FontAwesomeIcon icon={minusicon}/></button>
            <input type="range" aria-label="크기"
                min={MIN_SCALE*100} max={MAX_SCALE*100} step="5"
                value={displayScale}
                onChange={(e)=>setScale(Number(e.target.value)/100)}
            />
            <button type="button" aria-label="크게" onClick={()=>zoomBy(1.2)}><FontAwesomeIcon icon={plusicon}/></button>
            <Percent>
                <input type="text" inputMode="numeric" aria-label="배율(%)"
                    value={draft ?? String(displayScale)}
                    onFocus={(e)=>e.target.select()}
                    onChange={(e)=>setDraft(e.target.value.replace(/[^0-9]/g,""))}
                    onBlur={commit}
                    onKeyDown={(e)=>{
                        if(e.key==="Enter"){ commit(); e.currentTarget.blur(); }
                        else if(e.key==="Escape"){ setDraft(null); e.currentTarget.blur(); }
                    }}
                />%
            </Percent>
        </Zoom>

        <Divider />
        <NavButton type="button" disabled={total===0}
            onClick={next}>
            다음 <FontAwesomeIcon icon={faChevronRight}/>
        </NavButton>

        <FullButton type="button" onClick={onFit} aria-pressed={fit}
            title="보기 영역에 꽉 맞는 최대 크기로 (F)">
            <FontAwesomeIcon icon={faExpand}/> 맞춤
        </FullButton>
    </Wrapper>)
}

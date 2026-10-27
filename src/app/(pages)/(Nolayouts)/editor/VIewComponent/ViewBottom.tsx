"use client"
import { useImages } from "@/app/(Context)/ImageProvider";
import { useLang } from "@/i18n/EditorLang"
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
    border-top: 1px solid var(--line);
    background-color: var(--bg);
    font-size: 13px;
    color: var(--text);
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
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: inherit;
    font-size: 13px;
    cursor: pointer;
    &:hover { background: var(--bg-soft); }
    &[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
`
const NavButton=styled.button`
    height: 30px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: inherit;
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) { background: var(--bg-soft); }
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
    background: var(--line);
`
const Zoom=styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);

    button {
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        font-size: 15px;
        cursor: pointer;
    }
    button:hover { color: var(--accent); }
    input { width: 110px; accent-color: var(--accent); }
`
/* 눌러서 숫자를 바로 쓴다. Enter·칸 밖 클릭이면 적용, Esc 면 취소. */
const Percent=styled.label`
    display: flex;
    align-items: center;
    gap: 1px;
    color: var(--text);
    font-variant-numeric: tabular-nums;

    input {
        width: 44px;
        height: 26px;
        padding: 0 4px;
        border: 1px solid transparent;
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: right;
        accent-color: auto;
    }
    input:hover { border-color: var(--line-strong); }
    input:focus { outline: none; border-color: var(--accent); background: var(--bg); }
`


/* ── 크기 막대 ───────────────────────────────────────────────
 *
 * 막대 가운데가 100%(원본)다. 사진마다 달라지는 건 「맞춤」 배율이고 100% 의 뜻은 늘 같다.
 * 일직선(10..800)으로 펴면 100% 가 왼쪽 11% 자리에 박히고 오른쪽은 대부분 쓸 일 없는 큰 배율이라,
 * 양쪽 절반을 각각 곱 비율로 편다 — 왼쪽 10→100%, 오른쪽 100→800%.
 * 가운데 근처(SNAP 안)에 오면 100% 에 붙인다.
 */
const SLIDER_MAX = 1000;
const SNAP = 15;
function scaleToPos(scale: number): number {
    const half = SLIDER_MAX / 2;
    return scale <= 1
        ? half * (1 - Math.log(scale) / Math.log(MIN_SCALE))
        : half + half * Math.log(scale) / Math.log(MAX_SCALE);
}
function posToScale(pos: number): number {
    const half = SLIDER_MAX / 2;
    if (Math.abs(pos - half) <= SNAP) return 1;
    return pos <= half
        ? Math.pow(MIN_SCALE, 1 - pos / half)
        : Math.pow(MAX_SCALE, (pos - half) / half);
}

export default function ViewBottom({
    Currentnumber,setCurrentnumber,viewmode,scale,setScale,fit,onFit}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>,
        fit:boolean,onFit:()=>void
    }
){
    const {images}=useImages();
    const {t}=useLang();
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
            <FontAwesomeIcon icon={faChevronLeft}/> {t.prev}
        </NavButton>

        <Page>{pageLabel()}</Page>
        <Divider />

        {viewmode!=="grid" && <Zoom>
            <button type="button" aria-label={t.zoomOut} onClick={()=>zoomBy(1/1.2)}><FontAwesomeIcon icon={minusicon}/></button>
            <input type="range" aria-label={t.size} list="zoom-marks"
                min={0} max={SLIDER_MAX} step="1"
                value={Math.round(scaleToPos(scale))}
                aria-valuetext={`${displayScale}%`}
                onChange={(e)=>setScale(clampScale(posToScale(Number(e.target.value))))}
            />
            {/* 가운데 눈금 = 100% */}
            <datalist id="zoom-marks"><option value={SLIDER_MAX/2} /></datalist>
            <button type="button" aria-label={t.zoomIn} onClick={()=>zoomBy(1.2)}><FontAwesomeIcon icon={plusicon}/></button>
            <Percent>
                <input type="text" inputMode="numeric" aria-label={t.zoomPercent}
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
        </Zoom>}

        <Divider />
        <NavButton type="button" disabled={total===0}
            onClick={next}>
            {t.next} <FontAwesomeIcon icon={faChevronRight}/>
        </NavButton>

        {viewmode!=="grid" && <FullButton type="button" onClick={onFit} aria-pressed={fit}
            title={t.fitTitle}>
            <FontAwesomeIcon icon={faExpand}/> {t.fit}
        </FullButton>}
    </Wrapper>)
}

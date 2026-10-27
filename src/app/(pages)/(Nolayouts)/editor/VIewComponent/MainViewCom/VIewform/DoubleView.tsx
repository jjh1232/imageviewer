"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import { useLang } from "@/i18n/EditorLang"
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useBoxSize, useNatural, usePanZoom } from "./useFit";

/*
 * 두 장 펼침. 지금 장(currentIndex)과 다음 장을 책처럼 틈 없이 붙여 놓는다.
 * 한 장 보기와 같은 원칙 — div 에 평범한 img, 크기는 실제 px 치수. 100% 는 useFit.ts 참고.
 *
 * 두 장을 **같은 높이**로 맞춘다. 높이 H 에서 두 장의 폭 합은 H × (가로/세로 비율의 합)이니,
 * 그 합이 영역 폭을 넘지 않고 H 가 영역 높이를 넘지 않는 가장 큰 H 가 「맞춤」이다.
 * 배율 숫자는 왼쪽 장 기준이다(왼쪽 장 원본 높이 × 배율 = H). 두 장 높이가 다르면 오른쪽 장은
 * 그 H 에 맞춰 따라간다.
 * 마지막 장이 홀수로 남으면 한 장만 가운데에 놓는다.
 */

const Scroller = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
`
/* 가운데 정렬과 스크롤을 같이 쓰기 위한 칸.
   가운데 정렬은 justify-content·align-items 가 아니라 **사진의 margin: auto(두 장이면 바깥쪽만)** 로 한다.
   justify-content: center 는 사진이 칸보다 크면 양쪽으로 똑같이 넘치게 해서, 왼쪽(과 위쪽)으로
   넘친 부분은 스크롤 0 보다 앞이라 스크롤로도 끌기로도 못 간다 — 확대하면 옆으로 못 가던 이유다.
   auto 여백은 남는 자리가 있을 때만 가운데로 밀고, 넘치면 0 이 되어 오른쪽·아래로만 넘친다. */
const Center = styled.div`
    min-width: 100%;
    min-height: 100%;
    display: flex;
`
const Page = styled.img`
    display: block;
    flex: none;
    margin-block: auto;
    max-width: none;           /* Tailwind 기본이 img 에 max-width:100% 를 건다. 그러면 확대해도
                                  폭만 영역에서 멈추고 높이만 늘어나 사진이 찌그러진다 */
    &:first-child { margin-left: auto; }   /* 두 장을 붙인 채 가운데로 — 바깥쪽 여백만 auto */
    &:last-child { margin-right: auto; }
    -webkit-user-drag: none;
    user-drag: none;
`

const DoubleView = ({ currentIndex, scale, fit, onFitRatio }: {
    currentIndex: number,
    scale: number, setScale: React.Dispatch<React.SetStateAction<number>>,
    fit: boolean, onFitRatio: (r: number) => void,
}) => {
    const { images } = useImages();
    const { t } = useLang();
    const left = images[currentIndex];
    const right = images[currentIndex + 1];
    const box = useRef<HTMLDivElement>(null);
    const { w: bw, h: bh } = useBoxSize(box);
    const nl = useNatural(left?.url);
    const nr = useNatural(right?.url);

    const ready = !!(nl && bw && bh && (!right || nr));
    let fitR = 0;
    if (ready) {
        const ratio = nl!.w / nl!.h + (right ? nr!.w / nr!.h : 0);
        fitR = Math.min(bh, bw / ratio) / nl!.h;
    }
    useEffect(() => { if (fitR) onFitRatio(fitR); }, [fitR, onFitRatio]);
    const s = fit ? fitR : scale;
    usePanZoom(box, s);

    if (!left) return null;
    const H = ready ? nl!.h * s : 0;
    const styleOf = (n: { w: number; h: number } | null) =>
        ready && n ? { height: Math.round(H), width: Math.round(H * n.w / n.h) }
                   : { maxWidth: right ? "50%" : "100%", maxHeight: "100%" };

    return (
        <Scroller ref={box} data-scroller>
            <Center>
                <Page src={left.url} alt={t.imageAlt(currentIndex + 1)} style={styleOf(nl)} draggable={false} />
                {right && <Page src={right.url} alt={t.imageAlt(currentIndex + 2)} style={styleOf(nr)} draggable={false} />}
            </Center>
        </Scroller>
    )
}
export default DoubleView;

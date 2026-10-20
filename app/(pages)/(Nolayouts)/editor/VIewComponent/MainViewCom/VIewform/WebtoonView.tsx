"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useBoxSize, useNatural, usePanZoom } from "./useFit";

/*
 * 웹툰형. 전부를 세로로 틈 없이 이어 붙이고 스크롤로 읽는다.
 *
 * 지금 몇 번째 장인지는 두 방향으로 맞춘다.
 *  - 스크롤 → 번호: 화면 위쪽 1/3 선에 걸린 장을 「지금 장」으로 올린다(아래 바·왼쪽 목록이 따라온다).
 *  - 번호 → 스크롤: 왼쪽 목록·이전/다음으로 번호가 바뀌면 그 장으로 스크롤한다.
 * 둘이 서로를 다시 부르면 무한히 튕기므로, 스크롤이 올린 번호는 fromScroll 에 적어 두고
 * 그 번호로는 스크롤하지 않는다.
 */

const Scroller = styled.div`
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: auto;
`
/* 읽는 폭. 웹툰은 세로로 끝없이 이어지므로 「맞춤」은 폭 기준 — 영역 폭에 꽉.
   맞춤을 풀면 지금 장의 원본 폭 × 배율(px). 웹툰은 장마다 폭이 같아서 이걸로 충분하다. */
const Column = styled.div`
    margin: 0 auto;
`
const Strip = styled.img`
    display: block;            /* inline 이면 장 사이에 글자 기준선만큼 틈이 생긴다 */
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
    user-drag: none;
`

const WebtoonView = ({ currentIndex, setCurrentIndex, scale, fit, onFitRatio }: {
    currentIndex: number,
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
    scale: number, setScale: React.Dispatch<React.SetStateAction<number>>,
    fit: boolean, onFitRatio: (r: number) => void,
}) => {
    const { images } = useImages();
    const scroller = useRef<HTMLDivElement>(null);
    const strips = useRef<(HTMLImageElement | null)[]>([]);
    const fromScroll = useRef<number | null>(null);
    const { w: bw } = useBoxSize(scroller);
    const nat = useNatural(images[currentIndex]?.url);
    const fitR = nat && bw ? bw / nat.w : 0;
    useEffect(() => { if (fitR) onFitRatio(fitR); }, [fitR, onFitRatio]);
    const s = fit ? fitR : scale;
    usePanZoom(scroller, s);
    const colWidth = fit || !nat ? "100%" : `${Math.round(nat.w * s)}px`;

    // 번호 → 스크롤
    useEffect(() => {
        if (fromScroll.current === currentIndex) { fromScroll.current = null; return; }
        strips.current[currentIndex]?.scrollIntoView({ block: "start" });
    }, [currentIndex]);

    // 스크롤 → 번호
    useEffect(() => {
        const root = scroller.current;
        if (!root) return;
        const onScroll = () => {
            const line = root.getBoundingClientRect().top + root.clientHeight / 3;
            let hit = 0;
            strips.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= line) hit = i; });
            setCurrentIndex(prev => {
                if (prev === hit) return prev;
                fromScroll.current = hit;
                return hit;
            });
        };
        root.addEventListener("scroll", onScroll, { passive: true });
        return () => root.removeEventListener("scroll", onScroll);
    }, [setCurrentIndex, images.length]);

    return (
        <Scroller ref={scroller} data-scroller>
            <Column style={{ width: colWidth }}>
                {images.map((img, i) => (
                    <Strip key={img.id} ref={el => { strips.current[i] = el; }}
                        src={img.url} alt={`이미지 ${i + 1}`} loading="lazy" draggable={false} />
                ))}
            </Column>
        </Scroller>
    )
}
export default WebtoonView;

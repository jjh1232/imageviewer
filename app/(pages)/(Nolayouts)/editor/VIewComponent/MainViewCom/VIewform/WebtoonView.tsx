"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { useBoxSize, useNatural, usePanZoom } from "./useFit";

/*
 * 웹툰형. 전부를 세로로 틈 없이 이어 붙이고 스크롤로 읽는다.
 *
 * 지금 몇 번째 장인지는 두 방향으로 맞춘다.
 *  - 스크롤 → 번호: 화면 위쪽 1/3 선에 걸린 장을 「지금 장」으로 올린다(아래 바·왼쪽 목록이 따라온다).
 *  - 번호 → 스크롤: 왼쪽 목록·이전/다음으로 번호가 바뀌면 그 장으로 스크롤한다.
 * 둘이 서로를 다시 부르면 무한히 튕기므로, 스크롤이 올린 장은 fromScroll 에 적어 두고
 * 그 장으로는 스크롤하지 않는다.
 *
 * **번호가 아니라 사진(id)으로 적는다.** 주소 불러오기가 뒤에서 앞쪽 빈 번호를 빼면
 * 같은 사진의 번호가 바뀐다(MainViewer 가 번호를 옮겨 준다). 번호로 비교하면 그걸
 * 「다른 장으로 가라」 로 알아듣고 그 장 맨 위로 튀었다 — 스크롤하면 왔다 갔다 하던 원인 하나.
 *
 * **폭은 지금 장이 아니라 첫 장 기준이다.** 지금 장을 따라가면, 스크롤로 장이 바뀔 때마다
 * 폭이 (새 장의 크기를 읽는 동안 100% 로) 바뀌어 모든 장의 높이가 바뀌고, 그만큼 스크롤이 밀려
 * 장이 또 바뀌었다 — 원인 둘. 웹툰은 장마다 폭이 같아서 첫 장 하나로 충분하다.
 *
 * **아직 안 받은 장은 높이를 잡아 둔다**(Strip 의 min-height). 0 이면 받을 때마다 아래가
 * 밀려 내려오고, 처음엔 전부가 화면 안이라 lazy 인데도 한꺼번에 받으려 든다 — 원인 셋.
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
/* 받기 전 자리. 첫 장의 비율을 알면 그 비율로(웹툰은 장마다 크기가 같다), 모르면 화면 60%.
   자리가 실제보다 작으면 빠르게 지나간 장이 뒤늦게 받아지며 늘어나고, 브라우저가 보던 자리를
   지키려고 스크롤을 그만큼 밀어 준다 — 휠 클릭으로 쭉 내릴 때 점점 빨라지던 원인이다. */
const Strip = styled.img`
    display: block;            /* inline 이면 장 사이에 글자 기준선만큼 틈이 생긴다 */
    width: 100%;
    height: auto;
    &:not([data-done]) { aspect-ratio: var(--ph-ratio, auto); min-height: var(--ph-min, 60vh); }
    -webkit-user-drag: none;
    user-drag: none;
`

/** 지금 장부터 이만큼 앞은 lazy 를 풀고 미리 받는다. 빠르게 내려도 빈 자리를 덜 만난다. */
const AHEAD = 8;
/** 미리 받기 범위를 이 단위로만 옮긴다 — 장이 바뀔 때마다 몇백 장을 다시 그리지 않게. */
const AHEAD_STEP = 4;

const done = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.dataset.done = ""; };

const WebtoonView = ({ currentIndex, setCurrentIndex, scale, fit, onFitRatio }: {
    currentIndex: number,
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
    scale: number, setScale: React.Dispatch<React.SetStateAction<number>>,
    fit: boolean, onFitRatio: (r: number) => void,
}) => {
    const { images } = useImages();
    const scroller = useRef<HTMLDivElement>(null);
    const strips = useRef<(HTMLImageElement | null)[]>([]);
    const fromScroll = useRef<string | null>(null);
    const imagesRef = useRef(images);
    useEffect(() => { imagesRef.current = images; }, [images]);
    const { w: bw } = useBoxSize(scroller);
    const nat = useNatural(images[0]?.url);
    const fitR = nat && bw ? bw / nat.w : 0;
    useEffect(() => { if (fitR) onFitRatio(fitR); }, [fitR, onFitRatio]);
    const s = fit ? fitR : scale;
    usePanZoom(scroller, s, { horizontalOnly: true });
    const colWidth = fit || !nat ? "100%" : `${Math.round(nat.w * s)}px`;
    const colStyle = {
        width: colWidth,
        ...(nat ? { "--ph-ratio": `${nat.w} / ${nat.h}`, "--ph-min": "0" } : {}),
    } as React.CSSProperties;

    // 번호 → 스크롤. 스크롤이 올린 장이면(번호만 바뀌었어도) 움직이지 않는다.
    useEffect(() => {
        const id = imagesRef.current[currentIndex]?.id;
        if (id && id === fromScroll.current) return;
        strips.current[currentIndex]?.scrollIntoView({ block: "start" });
    }, [currentIndex]);

    /*
     * 스크롤 → 번호.
     * 한 프레임에 한 번만 센다(자동 스크롤은 매 프레임 scroll 을 보낸다).
     * 처음부터 세지 않고 **지난번 장에서부터** 위·아래로 몇 칸만 옮겨 본다 — 예전엔 매번 1 장부터
     * 지금 장까지 전부 위치를 재서, 아래로 갈수록 한 번에 몇백 번씩 재느라 버벅였다.
     */
    useEffect(() => {
        const root = scroller.current;
        if (!root) return;
        let frame = 0;
        let hit = 0;
        const topOf = (i: number) => strips.current[i]?.getBoundingClientRect().top ?? Infinity;
        const measure = () => {
            frame = 0;
            const n = imagesRef.current.length;
            if (n === 0) return;
            const line = root.getBoundingClientRect().top + root.clientHeight / 3;
            hit = Math.min(hit, n - 1);
            while (hit + 1 < n && topOf(hit + 1) <= line) hit++;
            while (hit > 0 && topOf(hit) > line) hit--;
            fromScroll.current = imagesRef.current[hit]?.id ?? null;
            const found = hit;
            setCurrentIndex(prev => (prev === found ? prev : found));
        };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
        root.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            root.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(frame);
        };
    }, [setCurrentIndex, images.length]);

    // 장 목록은 미리 받기 범위가 옮겨질 때만 다시 만든다(AHEAD_STEP 마다).
    const aheadTo = Math.floor(currentIndex / AHEAD_STEP) * AHEAD_STEP + AHEAD;
    const list = useMemo(() => images.map((img, i) => (
        <Strip key={img.id} ref={el => { strips.current[i] = el; }}
            src={img.url} alt={`이미지 ${i + 1}`} draggable={false}
            loading={i <= aheadTo ? "eager" : "lazy"}
            onLoad={done} onError={done} />
    )), [images, aheadTo]);

    return (
        <Scroller ref={scroller} data-scroller>
            <Column style={colStyle}>{list}</Column>
        </Scroller>
    )
}
export default WebtoonView;

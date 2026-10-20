"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useBoxSize, useNatural, usePanZoom } from "./useFit";

/*
 * 여기서는 react-zoom-pan-pinch 를 쓰지 않는다.
 *
 * 그 라이브러리는 이미지를 여러 겹의 div 와 transform 으로 감싸고,
 * 자기 안의 img 에 pointer-events:none 까지 건다. 그러면 브라우저가 그 자리를
 * 「이미지」로 인식하지 못해서, 웨일의 이미지 번역 같은 기능이 메뉴에 아예 안 뜬다.
 *
 * 그래서 메인도 왼쪽 썸네일과 같은 모양으로 뒀다 — div 에 평범한 img 하나.
 * 크기는 transform 이 아니라 실제 px 치수로 준다. transform: scale() 은 겉보기만 키워서
 * 스크롤 영역이 안 생기고, 브라우저 번역이 글자를 덮어 그릴 때 위치도 어긋난다.
 * 100% 가 무엇인지는 useFit.ts 참고.
 */

const Scroller = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
`

/* 가운데 정렬과 스크롤을 같이 쓰기 위한 칸.
   가운데 정렬은 justify-content·align-items 가 아니라 **사진의 margin: auto** 로 한다.
   justify-content: center 는 사진이 칸보다 크면 양쪽으로 똑같이 넘치게 해서, 왼쪽(과 위쪽)으로
   넘친 부분은 스크롤 0 보다 앞이라 스크롤로도 끌기로도 못 간다 — 확대하면 옆으로 못 가던 이유다.
   auto 여백은 남는 자리가 있을 때만 가운데로 밀고, 넘치면 0 이 되어 오른쪽·아래로만 넘친다. */
const Center = styled.div`
    min-width: 100%;
    min-height: 100%;
    display: flex;
`

const ImageStyle = styled.img`
    display: block;
    flex: none;
    margin: auto;
    max-width: none;           /* Tailwind 기본이 img 에 max-width:100% 를 건다. 그러면 확대해도
                                  폭만 영역에서 멈추고 높이만 늘어나 사진이 찌그러진다 */
    -webkit-user-drag: none;   /* 끌 때 브라우저 기본 이미지 드래그가 끼어들지 않게 */
    user-drag: none;
`

const SingleView = ({ currentIndex, scale, fit, onFitRatio }: {
    currentIndex: number,
    scale: number, setScale: React.Dispatch<React.SetStateAction<number>>,
    fit: boolean, onFitRatio: (r: number) => void,
}) => {

    const { images } = useImages();
    const image = images[currentIndex];
    const box = useRef<HTMLDivElement>(null);
    const { w: bw, h: bh } = useBoxSize(box);
    const nat = useNatural(image?.url);

    // 맞춤 배율: 가로·세로 중 먼저 닿는 쪽. 원본 크기를 아직 모르면 0.
    const fitR = nat && bw && bh ? Math.min(bw / nat.w, bh / nat.h) : 0;
    useEffect(() => { if (fitR) onFitRatio(fitR); }, [fitR, onFitRatio]);
    const s = fit ? fitR : scale;
    usePanZoom(box, s);

    if (!image) return null;

    // 원본 크기를 모르는 첫 순간에는 일단 영역 안에만 넣어 둔다.
    const size = nat && s
        ? { width: Math.round(nat.w * s), height: Math.round(nat.h * s) }
        : { maxWidth: "100%", maxHeight: "100%" };

    return (
        <Scroller ref={box} data-scroller>
            <Center>
                <ImageStyle
                    src={image.url}
                    alt={`이미지 ${currentIndex + 1}`}
                    style={size}
                    draggable={false}
                />
            </Center>
        </Scroller>
    )
}
export default SingleView;

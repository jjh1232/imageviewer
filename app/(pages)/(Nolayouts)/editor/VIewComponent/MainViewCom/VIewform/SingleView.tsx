"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import React from "react";
import styled from "styled-components";

/*
 * 여기서는 react-zoom-pan-pinch 를 쓰지 않는다.
 *
 * 그 라이브러리는 이미지를 여러 겹의 div 와 transform 으로 감싸고,
 * 자기 안의 img 에 pointer-events:none 까지 건다. 그러면 브라우저가 그 자리를
 * 「이미지」로 인식하지 못해서, 웨일의 이미지 번역 같은 기능이 메뉴에 아예 안 뜬다.
 *
 * 그래서 메인도 왼쪽 썸네일과 같은 모양으로 뒀다 — div 에 평범한 img 하나.
 */

const Scroller = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
`

/* 가운데 정렬과 스크롤을 같이 쓰기 위한 칸.
   Scroller 에 바로 가운데 정렬을 걸면, 내용이 넘칠 때 위쪽과 왼쪽이 잘려서
   스크롤로도 못 본다. 최소 크기를 화면만큼 주고 내용에 따라 커지게 하면
   넘치는 만큼 스크롤 영역이 제대로 생긴다. */
const Center = styled.div`
    min-width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`

/* 크기를 transform 이 아니라 실제 치수로 바꾼다.
   transform: scale() 은 겉보기만 키워서 레이아웃 크기가 그대로다.
   그러면 확대해도 스크롤 영역이 안 생겨 넘친 부분이 잘리고,
   브라우저 번역이 글자를 덮어 그릴 때 위치도 어긋난다.

   100% 면 화면에 맞춘 크기다. 원본이 화면보다 작으면 원본 크기 그대로 두고
   억지로 늘리지 않는다. */
const ImageStyle = styled.img<{ $scale: number }>`
    display: block;
    width: auto;
    height: auto;
    max-width: ${({ $scale }) => $scale * 100}%;
    max-height: ${({ $scale }) => $scale * 100}%;
    object-fit: contain;

    -webkit-user-drag: none;   /* 끌 때 브라우저 기본 이미지 드래그가 끼어들지 않게 */
    user-drag: none;
`

const SingleView = ({ currentIndex, scale }: {
    currentIndex: number,
    scale: number, setScale: React.Dispatch<React.SetStateAction<number>>
}) => {

    const { images } = useImages();
    const image = images[currentIndex];

    if (!image) return null;

    return (
        <Scroller>
            <Center>
                <ImageStyle
                    src={image.url}
                    alt={`이미지 ${currentIndex + 1}`}
                    $scale={scale}
                    draggable={false}
                />
            </Center>
        </Scroller>
    )
}
export default SingleView;

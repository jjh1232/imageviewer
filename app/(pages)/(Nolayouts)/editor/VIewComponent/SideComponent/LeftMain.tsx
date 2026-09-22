"use client"

import { useImages } from "@/app/(Context)/ImageProvider"
import React from "react"
import styled from "styled-components"

const Wrapper = styled.div`
    flex: 1;
    min-height: 0;          /* 부모가 flex 라 이게 없으면 스크롤이 안 생긴다 */
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`

const Empty = styled.p`
    margin: 24px 8px;
    color: #8a919c;
    font-size: 13px;
    line-height: 1.6;
    text-align: center;
`

/* 한 줄 = 썸네일 + 이름 + 지우기. 통째로 눌러서 그 장으로 넘어간다. */
const Row = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 6px;
    border: 1px solid ${({ $active }) => ($active ? "#4f46e5" : "transparent")};
    border-radius: 8px;
    background: ${({ $active }) => ($active ? "#eef2ff" : "transparent")};
    cursor: pointer;
    text-align: left;
    font: inherit;

    &:hover {
        background: ${({ $active }) => ($active ? "#eef2ff" : "#f3f4f6")};
    }
`

const Thumb = styled.img`
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 6px;
    background: #e9ecf1;
    object-fit: cover;      /* 예전에는 이게 없어서 세로 그림이 눌려 보였다 */
`

const Meta = styled.span`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;           /* 긴 파일명이 줄을 밀어내지 않게 */
`

const Name = styled.span`
    font-size: 13px;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const Sub = styled.span`
    font-size: 11px;
    color: #8a919c;
`

const Remove = styled.span`
    margin-left: auto;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #8a919c;
    font-size: 14px;
    line-height: 1;

    &:hover {
        background: #e6e9ee;
        color: #b4433b;
    }
`

/** 파일 크기를 읽기 좋은 단위로. */
const readableSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function LeftMain({
    Currentnumber, setCurrentnumber, }:
    { Currentnumber: number, setCurrentnumber: React.Dispatch<React.SetStateAction<number>>; }
) {

    const { images, removeImage } = useImages();

    if (images.length === 0) {
        return (
            <Wrapper>
                <Empty>이미지가 없습니다.<br />위의 인풋으로 고르거나 여기에 끌어다 놓으세요.</Empty>
            </Wrapper>
        )
    }

    /* 지운 장이 마지막이었으면 현재 번호가 목록 밖으로 나간다. 한 칸 당겨준다. */
    const handleRemove = (e: React.MouseEvent, id: string, index: number) => {
        e.stopPropagation();            // 줄 클릭(장 이동)까지 같이 타지 않게
        removeImage(id);
        if (index <= Currentnumber) {
            setCurrentnumber(prev => Math.max(0, prev - 1));
        }
    }

    return (
        <Wrapper>
            {images.map((data, index) => (
                <Row
                    key={data.id}
                    type="button"
                    $active={index === Currentnumber}
                    onClick={() => setCurrentnumber(index)}
                >
                    <Thumb src={data.url} alt="" />
                    <Meta>
                        <Name title={data.title}>{data.title}</Name>
                        <Sub>{index + 1} · {readableSize(data.size)}</Sub>
                    </Meta>
                    <Remove
                        role="button"
                        aria-label="목록에서 지우기"
                        onClick={(e) => handleRemove(e, data.id, index)}
                    >
                        ×
                    </Remove>
                </Row>
            ))}
        </Wrapper>
    )
}

"use client"

import { useImages } from "@/app/(Context)/ImageProvider"
import React, { useEffect, useRef } from "react"
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
    color: var(--muted);
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
    border: 1px solid ${({ $active }) => ($active ? "var(--accent)" : "transparent")};
    border-radius: 8px;
    background: ${({ $active }) => ($active ? "var(--accent-soft)" : "transparent")};
    cursor: pointer;
    text-align: left;
    font: inherit;

    &:hover {
        background: ${({ $active }) => ($active ? "var(--accent-soft)" : "var(--bg-soft)")};
    }
`

const Thumb = styled.img`
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 6px;
    background: var(--bg-sunk);
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
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const Sub = styled.span`
    font-size: 11px;
    color: var(--muted);
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
    color: var(--muted);
    font-size: 14px;
    line-height: 1;

    &:hover {
        background: var(--line);
        color: var(--danger);
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
    Currentnumber, setCurrentnumber, onJump }:
    { Currentnumber: number, setCurrentnumber: React.Dispatch<React.SetStateAction<number>>; onJump: (i: number) => void }
) {

    const { images, removeImage } = useImages();

    /* 지금 장이 늘 보이게 따라 내려간다 — 목록 보기에서 몇백 번째 장을 눌러 열어도 여기서 그 줄이 보인다.
       nearest: 이미 보이면 움직이지 않고, 넘길 때는 한 줄씩만 따라간다. */
    const active = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        active.current?.scrollIntoView({ block: "nearest" });
    }, [Currentnumber, images.length]);

    if (images.length === 0) {
        return (
            <Wrapper>
                <Empty>이미지가 없습니다.<br />위의 「파일 열기」나 주소로 불러오거나<br />여기에 끌어다 놓으세요.</Empty>
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
                    ref={index === Currentnumber ? active : undefined}
                    aria-current={index === Currentnumber ? "true" : undefined}
                    onClick={() => onJump(index)}   // 건너뛰기 — 뒤로가기로 돌아온다
                >
                    {/* lazy — 주소로 몇백 장을 불러오면 목록이 그걸 전부 한꺼번에 받으려 든다 */}
                    <Thumb src={data.url} alt="" loading="lazy" decoding="async" />
                    <Meta>
                        <Name title={data.title}>{data.title}</Name>
                        {/* 주소로 불러온 장은 크기를 모른다(0). 대신 묶음 이름(a, b …)을 보여 준다. */}
                        <Sub>{[index + 1, readableSize(data.size) || data.group?.name].filter(Boolean).join(" · ")}</Sub>
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

"use client"
import { useImages } from "@/app/(Context)/ImageProvider"
import { useLang } from "@/i18n/EditorLang"
import type { ImageItem } from "@/app/(Tools)/UserImageManager";
import { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";

/*
 * 목록. 전부를 바둑판으로 깔아 원하는 장을 찾는다 — 주소로 몇백 장을 불러오면
 * 왼쪽 목록은 한 줄에 하나라 끝없이 내려야 한다.
 *
 * 두 단계다.
 *   묶음      묶음마다 첫 장을 대표로 한 칸. 누르면 그 묶음의 장들로.
 *   장        그 묶음의 장들. 누르면 그 장으로 가서 목록에 오기 전 모드로 돌아간다(onPick).
 * 묶음은 주소 불러오기의 바깥 칸 값마다(a, b, c), 파일은 한 번 열 때마다 하나다(ImageItem.group).
 * 묶음이 하나뿐이면 묶음 단계를 건너뛴다.
 * 묶음은 찾기용 정리일 뿐이다 — 읽을 때는 전부 한 줄로 이어진다(a 의 끝에서 다음 → b 의 처음).
 *
 * 칸 크기는 고정이다(사용자가 크기 막대는 필요 없다고 했다). 폭에 따라 한 줄 칸 수만 바뀐다.
 * 사진은 loading="lazy" — 몇백 장이어도 화면에 보이는 것만 받는다.
 */

const Scroller = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
`
const Crumb = styled.div`
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--line);
    background: var(--bg-soft);
    font-size: 13px;
    color: var(--muted);
    button {
        padding: 2px 6px;
        border: none;
        border-radius: 6px;
        background: none;
        color: var(--accent);
        font-size: 13px;
        cursor: pointer;
    }
    button:hover { background: var(--accent-soft); }
    b { color: var(--text); }
`
const Grid = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
    margin: 0;
    padding: 16px;
    list-style: none;
`
const Cell = styled.button<{ $on: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    padding: 6px;
    border: 2px solid ${({ $on }) => ($on ? "var(--accent)" : "transparent")};
    border-radius: 12px;
    background: ${({ $on }) => ($on ? "var(--accent-soft)" : "transparent")};
    color: var(--text);
    text-align: left;
    cursor: pointer;
    &:hover { background: ${({ $on }) => ($on ? "var(--accent-soft)" : "var(--bg)")}; }
`
/* 사진마다 비율이 달라도 칸 높이를 맞춘다. 잘라내지 않고(contain) 칸 안에 다 보이게. */
const Thumb = styled.span<{ $stack?: boolean }>`
    display: flex;
    height: 200px;
    border-radius: 6px;
    background: var(--bg-sunk);
    overflow: hidden;
    /* 묶음 칸은 뒤에 장이 겹쳐 있는 것처럼 — 장 칸과 한눈에 구분되게 */
    box-shadow: ${({ $stack }) => ($stack ? "4px 4px 0 -1px var(--bg-sunk), 4px 4px 0 0 var(--line-strong)" : "none")};
    img {
        width: 100%;
        height: 100%;
        max-width: none;
        object-fit: contain;
    }
`
const Label = styled.span`
    display: flex;
    gap: 6px;
    min-width: 0;
    font-size: 12px;
    color: var(--muted);
    b { flex-shrink: 0; color: var(--text); font-variant-numeric: tabular-nums; }
    span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`

type Group = { id: string; name: string; items: { img: ImageItem; index: number }[] };

/*
 * 목록 스크롤 자리. 뒤로가기 기록(useJumpHistory)이 떠날 때 읽고(gridScrollTop), 돌아올 때 넘겨준다
 * (restoreGridTop). 목록은 떠나면 통째로 사라지므로 바깥(모듈)에 둔다 — 뷰어는 한 화면에 하나뿐이다.
 * 열어 둔 묶음은 Viewstructure 의 상태다(openId).
 */
let lastTop = 0;
let pendingTop: number | null = null;
export const gridScrollTop = () => lastTop;
export const restoreGridTop = (top: number) => { pendingTop = top; };

/** 나온 순서대로 묶는다. 묶음 정보가 없는 사진은 한 묶음으로 모은다. */
function groupImages(images: ImageItem[]): Group[] {
    const map = new Map<string, Group>();
    images.forEach((img, index) => {
        const id = img.group?.id ?? "";
        let g = map.get(id);
        if (!g) map.set(id, g = { id, name: img.group?.name ?? "", items: [] });
        g.items.push({ img, index });
    });
    return [...map.values()];
}

export default function GridView({ currentIndex, onPick, openId, onOpenGroup }: {
    currentIndex: number; onPick: (i: number) => void;
    openId: string | null; onOpenGroup: (id: string | null) => void;
}) {
    const { images } = useImages();
    const { t } = useLang();
    const groups = useMemo(() => groupImages(images), [images]);
    const single = groups.length <= 1;

    // 열어 둔 묶음. 묶음이 하나뿐이면 늘 그 묶음이다.
    const open = single ? groups[0] : groups.find((g) => g.id === openId);
    const currentGroup = images[currentIndex]?.group?.id ?? "";

    // 들어오면(또 단계를 바꾸면) 보던 장·보던 묶음이 보이게.
    const current = useRef<HTMLButtonElement>(null);
    const scroller = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scroller.current;
        if (!el) return;
        if (pendingTop !== null) {
            // 뒤로가기로 돌아왔으면 떠난 자리로. 그사이 넘겨 본 장이 화면 밖이면 그만큼만 따라간다.
            el.scrollTop = pendingTop;
            pendingTop = null;
            current.current?.scrollIntoView({ block: "nearest" });
        } else if (current.current) current.current.scrollIntoView({ block: "center" });
        else el.scrollTo({ top: 0 });
        lastTop = el.scrollTop;
    }, [open?.id]);

    useEffect(() => {
        const el = scroller.current;
        const remember = () => { lastTop = el?.scrollTop ?? 0; };
        el?.addEventListener("scroll", remember, { passive: true });
        return () => el?.removeEventListener("scroll", remember);
    }, []);

    return (
        <Scroller ref={scroller}>
            {!single && open && (
                <Crumb>
                    {/* 뒤로가기(위 막대 ←)와 다르다 — 왔던 길이 아니라 늘 묶음 화면으로 간다. 그래서 화살표 없이 위치 표시로. */}
                    <button type="button" onClick={() => onOpenGroup(null)}>{t.gridAll}</button>
                    › <b>{open.name}</b> · {t.count(open.items.length)}
                </Crumb>
            )}
            <Grid>
                {open
                    ? open.items.map(({ img, index }) => (
                        <li key={img.id}>
                            <Cell type="button" $on={index === currentIndex} ref={index === currentIndex ? current : undefined}
                                onClick={() => onPick(index)} title={img.title}>
                                <Thumb><img src={img.url} alt={img.title} loading="lazy" decoding="async" /></Thumb>
                                <Label><b>{index + 1}</b><span>{img.title}</span></Label>
                            </Cell>
                        </li>
                    ))
                    : groups.map((g) => (
                        <li key={g.id}>
                            <Cell type="button" $on={g.id === currentGroup} ref={g.id === currentGroup ? current : undefined}
                                onClick={() => onOpenGroup(g.id)} title={g.name}>
                                <Thumb $stack><img src={g.items[0].img.url} alt={g.name} loading="lazy" decoding="async" /></Thumb>
                                <Label><span>{g.name}</span><b>{t.count(g.items.length)}</b></Label>
                            </Cell>
                        </li>
                    ))}
            </Grid>
        </Scroller>
    );
}

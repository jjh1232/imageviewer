"use client"
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * 크기의 규칙.
 *
 *   **100% = 원본 크기**(원본 픽셀 하나가 화면 픽셀 하나).
 *   **맞춤 = 보기 영역에 꽉 맞는 최대 크기.** 그때의 배율은 사진마다 다르다(187%, 46% …).
 *
 * 맞춤은 「상태」다. 켜져 있으면 장을 넘겨도 새 장이 다시 꽉 맞고, 아래 막대의 숫자가
 * 그 장의 배율로 바뀐다. +/−·슬라이더·숫자 입력·Ctrl+휠은 맞춤을 풀고 지금 배율에서 움직인다.
 * 보기들은 자기가 계산한 맞춤 배율을 onFitRatio 로 올려 보낸다 — 숫자를 보여 주고,
 * 맞춤을 푼 순간 그 배율에서 이어 가기 위해서다.
 *
 * 맞춘 크기는 CSS 가 아니라 여기서 px 로 계산한다. CSS 로는 「가로·세로 중 먼저 닿는 쪽에
 * 맞추면서 원본보다도 키우기」를 비율을 지킨 채 할 수가 없다(object-fit 은 상자만 커져서
 * 확대하면 빈 여백까지 스크롤된다).
 */

/** 영역(스크롤 칸)의 안쪽 크기. 창이나 왼쪽 목록 폭이 바뀌면 다시 잰다. */
export function useBoxSize(ref: RefObject<HTMLElement | null>) {
    const [size, setSize] = useState({ w: 0, h: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return size;
}

/** 이미지 원본 크기. 주소가 바뀌면 다시 읽는다. 아직 모르면 null. */
export function useNatural(url: string | undefined) {
    const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
    useEffect(() => {
        setNat(null);
        if (!url) return;
        const img = new Image();
        img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = url;
        return () => { img.onload = null; };
    }, [url]);
    return nat;
}

/* ── 확대 범위 ───────────────────────────────────────────────── */

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 8;    // 작은 사진을 맞춤하면 이미 수백 % 다. 그 위로도 키울 자리가 있어야 한다
export const clampScale = (s: number) => Number(Math.min(MAX_SCALE, Math.max(MIN_SCALE, s)).toFixed(3));

/* ── 확대 기준점 ─────────────────────────────────────────────── */

/**
 * 다음 확대·축소를 어디를 기준으로 할지(화면 좌표). null 이면 보기 영역 가운데.
 * Ctrl+휠이 커서 자리를 적어 두고 scale 을 바꾸면, usePanZoom 이 그 자리를 붙잡은 채 키운다.
 * 버튼·슬라이더·숫자 입력은 적지 않으므로 가운데 기준이다.
 */
let anchor: { x: number; y: number } | null = null;
export const setZoomAnchor = (p: { x: number; y: number } | null) => { anchor = p; };

/**
 * 스크롤 칸에 두 가지를 붙인다.
 *
 * 1) 끌어서 시점 옮기기 — 사진이 영역보다 커서 넘칠 때만. 커서가 손바닥(grab)이 된다.
 *    img 에 pointer-events:none 을 걸지 않는다(웨일 이미지 번역이 죽는다 — SingleView 머리말).
 *    대신 칸 자체가 포인터를 잡는다.
 *
 * 2) 확대해도 보던 자리 유지 — 크기가 바뀌기 직전의 「기준점 아래 내용이 전체의 몇 % 자리였나」를
 *    기억해 두었다가, 바뀐 뒤 같은 % 자리가 기준점에 오도록 스크롤을 옮긴다.
 *    직전 값은 렌더가 끝날 때마다 snap() 으로 적어 둔다 — 크기가 바뀐 뒤에는 이미 늦기 때문이다.
 */
export function usePanZoom(ref: RefObject<HTMLElement | null>, scale: number) {
    const last = useRef({ sl: 0, st: 0, sw: 1, sh: 1 });
    const prevScale = useRef(scale);

    const overflows = (el: HTMLElement) =>
        el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;

    // 끌어서 옮기기
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let drag: { x: number; y: number; sl: number; st: number } | null = null;

        const down = (e: PointerEvent) => {
            if (e.button !== 0 || !overflows(el)) return;
            drag = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
            try { el.setPointerCapture(e.pointerId); } catch { /* 이미 끝난 포인터면 못 잡는다 — 끌기는 그대로 된다 */ }
            el.style.cursor = "grabbing";
            e.preventDefault();    // 끄는 동안 글자·이미지 선택이 끼어들지 않게
        };
        const move = (e: PointerEvent) => {
            if (!drag) return;
            el.scrollLeft = drag.sl - (e.clientX - drag.x);
            el.scrollTop = drag.st - (e.clientY - drag.y);
        };
        const up = (e: PointerEvent) => {
            if (!drag) return;
            drag = null;
            if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
            el.style.cursor = overflows(el) ? "grab" : "";
        };
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        return () => {
            el.removeEventListener("pointerdown", down);
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerup", up);
            el.removeEventListener("pointercancel", up);
        };
    }, [ref]);

    // 스크롤할 때마다 직전 값을 갱신
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const snap = () => { last.current = { sl: el.scrollLeft, st: el.scrollTop, sw: el.scrollWidth, sh: el.scrollHeight }; };
        el.addEventListener("scroll", snap, { passive: true });
        return () => el.removeEventListener("scroll", snap);
    }, [ref]);

    // 렌더가 끝날 때마다: 크기가 바뀌었으면 기준점을 붙잡고, 직전 값을 다시 적는다
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (prevScale.current !== scale) {
            prevScale.current = scale;
            let ax = el.clientWidth / 2, ay = el.clientHeight / 2;
            if (anchor) {
                const r = el.getBoundingClientRect();
                ax = anchor.x - r.left; ay = anchor.y - r.top;
                anchor = null;
            }
            const p = last.current;
            const rx = (p.sl + ax) / p.sw, ry = (p.st + ay) / p.sh;
            el.scrollLeft = rx * el.scrollWidth - ax;
            el.scrollTop = ry * el.scrollHeight - ay;
        }
        last.current = { sl: el.scrollLeft, st: el.scrollTop, sw: el.scrollWidth, sh: el.scrollHeight };
        el.style.cursor = overflows(el) ? "grab" : "";
    });
}

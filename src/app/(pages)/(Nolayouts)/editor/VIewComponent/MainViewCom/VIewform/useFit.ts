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
 *    **스크롤바 위에서 누른 것은 끌기가 아니다.** 예전엔 그것까지 잡아서, 스크롤바를 끌어 올리면
 *    브라우저는 위로·끌기는 아래로 움직여 둘이 싸웠다(웹툰에서 왔다 갔다 하던 원인).
 *    **휠 클릭 자동 스크롤과 겹치지 않는다.** 휠을 짧게 눌러 켠 자동 스크롤은 아무 버튼이나 다시
 *    눌러야 꺼지는데, 그 왼쪽 클릭을 끌기로 잡아서 자동 스크롤과 끌기가 같이 움직였다.
 *    그래서 자동 스크롤이 켜져 있는 동안의 다음 클릭은 끄기로 보고 끌기를 시작하지 않는다.
 *    휠을 누른 채 움직였다 놓으면 놓는 순간 자동 스크롤이 끝나므로 그때는 넘어가지 않는다.
 *    horizontalOnly — 웹툰처럼 세로로는 늘 넘치는 보기. 세로는 휠·스크롤바로 움직이는 것이라
 *    옆으로 넘칠 때(확대해서 화면보다 넓을 때)만 끌기·손바닥 커서를 쓴다. 안 그러면 커서가 늘 손바닥이다.
 *
 * 2) 확대해도 보던 자리 유지 — 크기가 바뀌기 직전의 「기준점 아래 내용이 전체의 몇 % 자리였나」를
 *    기억해 두었다가, 바뀐 뒤 같은 % 자리가 기준점에 오도록 스크롤을 옮긴다.
 *    직전 값은 렌더가 끝날 때마다 snap() 으로 적어 둔다 — 크기가 바뀐 뒤에는 이미 늦기 때문이다.
 */
export function usePanZoom(ref: RefObject<HTMLElement | null>, scale: number, { horizontalOnly = false } = {}) {
    const last = useRef({ sl: 0, st: 0, sw: 1, sh: 1 });
    const prevScale = useRef(scale);

    const overflows = (el: HTMLElement) =>
        el.scrollWidth > el.clientWidth + 1 || (!horizontalOnly && el.scrollHeight > el.clientHeight + 1);

    /** 스크롤바 위인가. clientWidth·clientHeight 는 스크롤바를 뺀 안쪽 크기다. */
    const onScrollbar = (el: HTMLElement, e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        return e.clientX - r.left >= el.clientLeft + el.clientWidth
            || e.clientY - r.top >= el.clientTop + el.clientHeight;
    };

    // 끌어서 옮기기
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let drag: { x: number; y: number; sl: number; st: number } | null = null;
        let middle: { x: number; y: number; t: number } | null = null;   // 휠 버튼을 누른 자리·때
        let autoScroll = false;                                          // 휠 클릭 자동 스크롤이 켜져 있다

        const down = (e: PointerEvent) => {
            if (e.button === 1) { middle = { x: e.clientX, y: e.clientY, t: e.timeStamp }; return; }
            if (autoScroll) { autoScroll = false; return; }   // 이 클릭은 자동 스크롤 끄기
            if (e.button !== 0 || !overflows(el) || onScrollbar(el, e)) return;
            drag = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
            try { el.setPointerCapture(e.pointerId); } catch { /* 이미 끝난 포인터면 못 잡는다 — 끌기는 그대로 된다 */ }
            el.style.cursor = "grabbing";
            e.preventDefault();    // 끄는 동안 글자·이미지 선택이 끼어들지 않게
        };
        const move = (e: PointerEvent) => {
            if (!drag) return;
            if (!(e.buttons & 1)) { end(e); return; }   // 놓은 걸 놓쳤다(창 밖에서 놓기 등)
            el.scrollLeft = drag.sl - (e.clientX - drag.x);
            el.scrollTop = drag.st - (e.clientY - drag.y);
        };
        const up = (e: PointerEvent) => {
            if (e.button === 1 && middle) {
                // 짧게 눌렀다 놓았으면 자동 스크롤이 켜진 채 남는다. 누른 채 움직였으면 놓을 때 끝난다.
                const moved = Math.hypot(e.clientX - middle.x, e.clientY - middle.y) > 10;
                autoScroll = !moved && e.timeStamp - middle.t < 500;
                middle = null;
                return;
            }
            end(e);
        };
        const end = (e: PointerEvent) => {
            if (!drag) return;
            drag = null;
            if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
            el.style.cursor = overflows(el) ? "grab" : "";
        };
        // 자동 스크롤을 보기 영역 밖(왼쪽 목록 등)을 눌러 껐으면 여기선 그 클릭을 못 본다.
        const downElsewhere = (e: PointerEvent) => {
            if (e.button !== 1 && !el.contains(e.target as Node)) autoScroll = false;
        };
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        document.addEventListener("pointerdown", downElsewhere);
        return () => {
            document.removeEventListener("pointerdown", downElsewhere);
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

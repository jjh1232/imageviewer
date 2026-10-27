"use client"
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { ImageItem } from "@/app/(Tools)/UserImageManager";
import { gridScrollTop, restoreGridTop } from "./MainViewCom/VIewform/GridView";

/*
 * 뒤로가기 — 「건너뛰기」만 기록한다.
 *
 *   기록함     목록에서 장 열기 · 왼쪽 목록에서 장 누르기 · 보기 바꾸기 · 목록에서 묶음 들어가기/나오기
 *   안 함      ← → · 휠 · 이전/다음 · 웹툰 스크롤 · 확대
 *
 * 한 장씩 넘기는 것까지 쌓으면 200장 읽은 뒤 뒤로가기를 200번 눌러야 하고, 웹툰은 스크롤만으로
 * 몇백 개가 쌓인다. 목록에서 들어가 몇십 장을 읽어도 뒤로가기 한 번이면 목록으로 나온다.
 *
 * 기록은 브라우저 기록(history)에 얹는다 — 주소는 그대로 두고 state 만. 그래서 브라우저 뒤로가기 ·
 * 마우스 뒤로 버튼 · 앞으로가기가 그대로 통하고, Esc 는 history.back() 이다.
 * 사진이 아니라 화면 상태(보기 · 보던 장 · 목록의 묶음과 스크롤)만 적는다. 보던 장은 번호가 아니라
 * id 로 — 주소 불러오기가 뒤에서 빈 번호를 빼면 번호가 밀린다.
 */

export type Mode = "single" | "double" | "webtoon" | "grid";

type Snap = { mode: Mode; index: number; id?: string; gridOpen: string | null; gridTop: number; n: number };
type Change = { mode?: Mode; index?: number; gridOpen?: string | null };

const KEY = "viewer";

export function useJumpHistory(s: {
    mode: Mode; setMode: (m: Mode) => void;
    index: number; setIndex: (i: number) => void;
    gridOpen: string | null; setGridOpen: (g: string | null) => void;
    images: RefObject<ImageItem[]>;
}) {
    // 이벤트에서 지금 값을 읽으려고 ref 에 둔다.
    const now = useRef(s);
    useEffect(() => { now.current = s; });
    const depth = useRef(0);    // 뷰어 안에서 쌓은 기록 수. 0 이면 Esc 로 더 갈 데가 없다.
    const [canBack, setCanBack] = useState(false);   // 위 막대 「←」 버튼을 켤지
    const setDepth = (n: number) => { depth.current = n; setCanBack(n > 0); };

    const snap = (n: number, c: Change = {}): Snap => {
        const v = now.current;
        const index = c.index ?? v.index;
        return {
            mode: c.mode ?? v.mode,
            index,
            id: v.images.current?.[index]?.id,
            gridOpen: c.gridOpen !== undefined ? c.gridOpen : v.gridOpen,
            // 묶음을 바꾸면 그 묶음의 처음부터. 아니면 지금 목록 스크롤 그대로.
            gridTop: c.gridOpen !== undefined ? 0 : gridScrollTop(),
            n,
        };
    };
    const write = (how: "push" | "replace", value: Snap) => {
        const state = { ...(history.state ?? {}), [KEY]: value };
        if (how === "push") history.pushState(state, "");
        else history.replaceState(state, "");
    };

    // 처음 열 때의 자리를 바닥으로 적어 둔다.
    useEffect(() => { write("replace", snap(0)); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    /** 건너뛰기. 떠나는 자리를 지금 기록에 적고(목록 스크롤 포함), 갈 자리를 새 기록으로 쌓는다. */
    const jump = useCallback((c: Change) => {
        const v = now.current;
        const same = (c.mode ?? v.mode) === v.mode && (c.index ?? v.index) === v.index
            && (c.gridOpen === undefined || c.gridOpen === v.gridOpen);
        if (same) return;
        write("replace", snap(depth.current));
        setDepth(depth.current + 1);
        write("push", snap(depth.current, c));
        if (c.mode !== undefined) v.setMode(c.mode);
        if (c.index !== undefined) v.setIndex(c.index);
        if (c.gridOpen !== undefined) v.setGridOpen(c.gridOpen);
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    // 뒤로·앞으로 — 그 기록의 자리로 돌린다.
    useEffect(() => {
        const onPop = (e: PopStateEvent) => {
            const to: Snap | undefined = e.state?.[KEY];
            if (!to) return;
            const v = now.current;
            const list = v.images.current ?? [];
            const at = to.id ? list.findIndex((i) => i.id === to.id) : -1;
            setDepth(to.n);
            restoreGridTop(to.gridTop);
            v.setMode(to.mode);
            v.setGridOpen(to.gridOpen);
            // 목록으로 돌아갈 때는 장을 되돌리지 않는다 — 방금까지 읽던 장에 강조가 가 있어야 한다.
            if (to.mode !== "grid") v.setIndex(at >= 0 ? at : Math.max(0, Math.min(to.index, list.length - 1)));
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    /** 한 걸음 뒤로. 뷰어 안에서 쌓은 기록이 없으면 false — 페이지를 떠나지 않는다. */
    const back = useCallback(() => {
        if (depth.current === 0) return false;
        history.back();
        return true;
    }, []);

    return { jump, back, canBack };
}

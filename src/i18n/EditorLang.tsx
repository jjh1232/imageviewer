"use client"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { XDEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./config";
import { EDITOR_DICTS, type EditorDict } from "./editor";

/*
 * 뷰어 언어. 주소에 언어를 넣지 않는다(/editor 하나) — 공유 링크·바로가기를 받은 사람이 자기 언어로 보게.
 *
 *   1. ?lang=ko      메인(/ko 등)의 「뷰어 열기」 가 붙여 보낸다. 기억하고 주소에서 뗀다
 *   2. 고른 언어      위 막대의 언어 선택. localStorage
 *   3. 브라우저 언어   navigator.languages 에서 처음 맞는 것
 *   4. 영어           메인의 x-default 와 같은 값
 *
 * 메인에서 넘어온 값이 기억해 둔 값보다 앞선다 — /ja 를 골라 들어왔으면 일본어를 원한 것이다.
 */
const KEY = "viewer-lang";

function pickLang(): Locale {
    const q = new URLSearchParams(location.search);
    const asked = q.get("lang");
    if (asked !== null) {
        q.delete("lang");
        const rest = q.toString();
        history.replaceState(history.state, "", location.pathname + (rest ? `?${rest}` : ""));
        if (isLocale(asked)) {
            try { localStorage.setItem(KEY, asked); } catch { /* 저장이 막혀도 이번엔 이 언어로 */ }
            return asked;
        }
    }
    try {
        const saved = localStorage.getItem(KEY);
        if (saved && isLocale(saved)) return saved;
    } catch { /* 막혀 있으면 브라우저 언어로 */ }
    for (const tag of navigator.languages ?? [navigator.language]) {
        const l = tag.slice(0, 2).toLowerCase();
        if (isLocale(l)) return l;
    }
    return XDEFAULT_LOCALE;
}

type LangState = { lang: Locale; setLang: (l: Locale) => void; t: EditorDict };
const LangContext = createContext<LangState | null>(null);

export function EditorLangProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Locale | null>(null);
    useEffect(() => setLangState(pickLang()), []);
    useEffect(() => { if (lang) document.documentElement.lang = lang; }, [lang]);

    const setLang = useCallback((l: Locale) => {
        try { localStorage.setItem(KEY, l); } catch { /* 이번 화면만 바뀐다 */ }
        setLangState(l);
    }, []);

    // 언어가 정해지기 전에는 그리지 않는다 — 영어로 번쩍였다가 바뀌는 걸 막는다. 한 프레임이다.
    if (!lang) return null;
    return <LangContext.Provider value={{ lang, setLang, t: EDITOR_DICTS[lang] }}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
    const v = useContext(LangContext);
    if (!v) throw new Error("useLang 은 EditorLangProvider 안에서만 쓴다");
    return v;
}

export { LOCALES };

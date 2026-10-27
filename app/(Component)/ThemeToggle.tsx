"use client"
import { useEffect, useState } from "react";
import { THEME_KEY } from "@/app/(Tools)/theme";

type Theme = "light" | "dark";

/** 지금 화면에 걸린 테마 — 고른 값이 없으면 시스템 설정. */
function currentTheme(): Theme {
    const set = document.documentElement.dataset.theme;
    if (set === "light" || set === "dark") return set;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * 밝게 ↔ 어둡게 전환 버튼. 누르면 <html data-theme> 을 바꾸고 기억한다.
 * 색 자체는 globals.css 의 변수가 바뀌어 따라온다.
 */
export default function ThemeToggle({ className }: { className?: string }) {
    // 서버에서는 테마를 모른다. 붙은 뒤에 읽어 아이콘을 맞춘다.
    const [theme, setTheme] = useState<Theme | null>(null);
    useEffect(() => setTheme(currentTheme()), []);

    const toggle = () => {
        const next: Theme = currentTheme() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem(THEME_KEY, next); } catch { /* 저장이 막혀도 이번 화면은 바뀐다 */ }
        setTheme(next);
    };

    const label = theme === "dark" ? "밝은 화면으로" : "어두운 화면으로";
    return (
        <button type="button" className={className} onClick={toggle} title={label} aria-label={label}>
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}

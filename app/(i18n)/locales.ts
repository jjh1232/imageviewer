/**
 * 언어 목록. 메인(main.ts)과 뷰어(editor.ts)가 같이 쓴다.
 * 사전과 따로 둔다 — 뷰어는 클라이언트라, main.ts 를 import 하면 메인 글 세 언어가 번들에 실린다.
 */
export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

/** 언어를 특정하지 못한 방문자를 보낼 곳. hreflang x-default 와 같은 값. */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
};

export function isLocale(value: string): value is Locale {
    return (LOCALES as readonly string[]).includes(value);
}

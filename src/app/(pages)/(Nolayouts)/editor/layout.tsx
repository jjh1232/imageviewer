/**
 * 뷰어(/imageviewer/editor)의 루트 레이아웃. 소개 화면([lang]/layout.tsx)과 따로다 —
 * 화면을 꽉 채우는 앱이라 헤더·푸터가 없고, 색도 뷰어 전용(globals.css)이다.
 *
 * 언어는 주소에 없다(EditorLang). <html lang> 은 붙은 뒤 EditorLang 이 고쳐 쓴다.
 * 공유 링크(?u=…)마다 다른 주소가 되므로 **색인하지 않는다** — 설명 글은 소개 화면에 있다.
 */
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { THEME_KEY } from "@/app/(Tools)/theme";
import { SITE } from "@/i18n/config";

/** 첫 그림 전에 고른 테마를 붙인다. 안 고른 사람은 시스템 설정 그대로(globals.css). */
const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
    metadataBase: new URL(SITE),
    title: "Comic & Webtoon Viewer | prelaps",
    robots: { index: false, follow: true },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    // suppressHydrationWarning — 위 스크립트가 React 보다 먼저 data-theme 을 붙이고,
    // EditorLang 이 lang 을 바꾸므로 서버 HTML 과 어긋나는 게 정상이다. <html> 한 단계에만 걸린다.
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
            </head>
            <body>{children}</body>
        </html>
    );
}

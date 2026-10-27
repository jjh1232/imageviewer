import type { Metadata } from "next";
import { LOCALES, DEFAULT_LOCALE, getDictionary, type Locale } from "@/app/(i18n)/main";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
    const lang = (await params).lang as Locale;
    const t = getDictionary(lang);

    // 모든 언어판이 같은 목록을 가져야 한다 — 하나라도 빠지면 구글이 통째로 무시한다.
    const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `/${l}`]));
    languages["x-default"] = `/${DEFAULT_LOCALE}`;

    return {
        title: { absolute: t.metaTitle },
        description: t.metaDescription,
        alternates: { canonical: `/${lang}`, languages },
    };
}

/*
 * 소개 화면. 칸으로 나누지 않고 위에서 아래로 이어지는 한 줄기 글이다 —
 * 제목 · 용도 · 뷰어 버튼, 그 아래로 사용법 · 사용 예시.
 * 글은 이 서버 컴포넌트에 직접 둔다. 클라이언트 컴포넌트 안에 넣으면 크롤러가 못 본다.
 */
export default async function Main({ params }: PageProps<"/[lang]">) {
    const lang = (await params).lang as Locale;
    const t = getDictionary(lang);

    return (
        <article className="MAINBOX">
            {/* 제목보다 먼저 둔다 — 오른쪽 위에 떠 있고 글이 그 옆과 아래로 감아 흐른다. */}
            {/* 뷰어가 이 언어로 열리게 알려 준다 — 뷰어는 기억하고 주소에서 뗀다(EditorLang) */}
            <a href={`/editor?lang=${lang}`} className="MAINBOX-open">{t.open} →</a>

            <h1>{t.tagline}</h1>
            <p className="MAINBOX-lead">{t.lead}</p>

            <h2>{t.how.h}</h2>
            <ul>
                {t.how.items.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <h2>{t.examples.h}</h2>
            <ul>
                {t.examples.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
        </article>
    );
}

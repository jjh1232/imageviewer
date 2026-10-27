import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/app/(i18n)/main";

/**
 * 언어 없는 / 는 비워 두고 Accept-Language 로 /ko · /en · /ja 에 보낸다.
 * 영구(301)로 보내지 않는다 — 브라우저가 기억해 버려 방문자가 언어를 되돌릴 수 없다.
 */
export default async function Home() {
    const accept = (await headers()).get("accept-language") ?? "";

    // "ko-KR,ko;q=0.9,en;q=0.8" → q 순으로 첫 번째로 맞는 언어
    const wanted = accept
        .split(",")
        .map((part) => {
            const [tag, q] = part.trim().split(";q=");
            return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
        })
        .sort((a, b) => b.q - a.q)
        .find(({ lang }) => (LOCALES as readonly string[]).includes(lang));

    redirect(`/${(wanted?.lang as Locale) ?? DEFAULT_LOCALE}`);
}

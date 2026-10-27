'use client';
/**
 * 언어 전환. Provider 가 아니라 **같은 경로의 다른 언어 주소로 가는 링크 묶음**이다.
 * 언어는 상태가 아니라 주소(/imageviewer/ko)가 정한다 — 그래야 언어마다 따로 색인된다.
 *
 * 지금 주소를 usePathname() 으로 읽어 언어 칸만 바꾼다. 그래서 하위 페이지(/ko/guide)를
 * 늘려도 이 파일은 안 고친다. 빌드 때 미리 그려지므로 링크는 HTML 에 그대로 들어 있다.
 *
 * next/link 가 아니라 <a> 다. 언어가 바뀌면 <html lang> 이 바뀌어야 해서 새로 여는 게 맞다.
 */
import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config';
import { localizePath } from '@/i18n/paths';

interface Props {
  lang: Locale;
  /** aria-label. 사전은 서버에만 있으므로 Header 가 번역해서 넘긴다 */
  label: string;
}

export default function LanguageSwitcher({ lang, label }: Props) {
  // basePath 는 빠진 채로 온다 — '/ko' · '/ko/guide'. 언어 뒤쪽만 떼어 둔다.
  const rest = (usePathname() ?? '').replace(/^\/[^/]+/, '');
  return (
    <nav className="langs" aria-label={label}>
      {LOCALES.map((l) => (
        <a key={l} href={localizePath(l, rest)} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined}>
          {LOCALE_LABELS[l]}
        </a>
      ))}
    </nav>
  );
}

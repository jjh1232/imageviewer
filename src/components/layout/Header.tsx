/**
 * 소개 화면 공통 헤더 — 허브로 가는 링크 · 도구 이름 · 언어 전환.
 * 서버 컴포넌트다. 언어 전환만 클라이언트(LanguageSwitcher)라 문구를 props 로 넘긴다.
 */
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/main';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <header>
      <div>
        {/* 허브는 basePath 밖이라 <a> 로 접두사 없이 쓴다 (next/link 면 /imageviewer 이 붙는다). */}
        <a className="home" href={`/${lang}`}>prelaps</a>
        <h1>{t.title}</h1>
        <p className="tagline">{t.tagline}</p>
      </div>
      <LanguageSwitcher lang={lang} label={t.langLabel} />
    </header>
  );
}

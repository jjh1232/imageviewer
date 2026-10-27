/**
 * 소개 화면의 루트 레이아웃 — <html lang> · 헤더 · 푸터. (템플릿 그대로, 사전만 main.ts)
 *
 * **app/layout.tsx 가 아니라 [lang] 안에 있다** — <html lang> 이 언어마다 정적으로 박혀야 해서다.
 * 뷰어(/editor)는 다른 루트 레이아웃((pages)/(Nolayouts)/editor/layout.tsx)을 쓴다 — 화면을 꽉 채우는
 * 도구라 헤더·푸터가 없고 색도 따로다.
 * 그 대가로 일반 not-found 는 둘 곳이 없다. 404 는 app/global-not-found.tsx 가 맡는다.
 */
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/global.css';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { LOCALES, SITE, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/main';

/** 목록에 없는 언어는 빌드하지 않는다. */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang}>
      <body>
        <div className="wrap">
          <Header lang={lang} />
          <main>{children}</main>
          <Footer lang={lang} />
        </div>
        <noscript><p style={{ color: 'var(--err)' }}>{t.noscript}</p></noscript>
      </body>
    </html>
  );
}

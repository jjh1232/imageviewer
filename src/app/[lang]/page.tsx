/**
 * 소개 화면 — /imageviewer/ko · /en · /ja  (→ out/ko.html …)
 *
 * 템플릿과 달리 도구 본체가 이 페이지에 없다. 뷰어는 화면을 꽉 채우는 앱이라 /imageviewer/editor 에
 * 따로 있고, 여기는 「뷰어 열기」 입구 + 사용법 + 사용 예시뿐이다(헌법 §7 콘텐츠).
 * 글은 이 서버 컴포넌트에 직접 둔다 — 클라이언트 컴포넌트 안에 넣으면 크롤러가 못 본다.
 */
import type { Metadata } from 'next';
import { BASE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/main';
import { pageMetadata, toolJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const t = getDictionary(lang);
  return pageMetadata({ lang, title: t.title, description: t.metaDescription });
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const lang = (await params).lang as Locale;
  const t = getDictionary(lang);
  const ld = toolJsonLd({ lang, title: t.title, description: t.metaDescription });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="panel intro">
        <p>{t.lead}</p>
        {/* 뷰어가 이 언어로 열리게 알려 준다 — 뷰어는 기억하고 주소에서 뗀다(EditorLang).
            next/link 가 아니라 <a> 다. BASE 를 직접 붙였으므로 Link 에 넣으면 두 번 붙는다. */}
        <a className="open" href={`${BASE}/editor?lang=${lang}`}>{t.open} →</a>
      </section>

      <section className="about">
        <h2>{t.how.h}</h2>
        <ul>
          {t.how.items.map((item) => <li key={item}>{item}</li>)}
        </ul>

        <h2>{t.examples.h}</h2>
        <ul>
          {t.examples.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </>
  );
}

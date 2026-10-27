/**
 * 페이지의 <head>(metadata)와 구조화 데이터. 순수 HTML 템플릿에서 언어판마다 복사하던 부분이다.
 *
 * ⚠ canonical·hreflang·og:url 은 **전부 https://prelaps.com/imageviewer/… 전체 주소로 직접 적는다.**
 *   Next 는 metadata 의 상대 경로를 metadataBase 로 풀 뿐 basePath 를 붙여 주지 않는다.
 *   '/ko' 로 적으면 canonical 이 허브의 prelaps.com/ko 를 가리키고, 화면에는 아무 표시가 없다.
 */
import type { Metadata } from 'next';
import { BASE, OG_LOCALE, type Locale } from '@/i18n/config';
import { absoluteUrl, hreflangMap, localizePath } from '@/i18n/paths';
import { getDictionary } from '@/i18n/main';

interface PageMeta {
  lang: Locale;
  /** 언어를 뺀 경로. '' = 언어 첫 페이지, '/guide' = 하위 페이지 */
  path?: string;
  title: string;
  description: string;
}

export function pageMetadata({ lang, path = '', title, description }: PageMeta): Metadata {
  const t = getDictionary(lang);
  const canonical = absoluteUrl(localizePath(lang, path));
  return {
    title: `${title} — ${t.titleTail} | prelaps`,
    description,
    alternates: { canonical, languages: hreflangMap(path) },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      locale: OG_LOCALE[lang],
      images: [{ url: absoluteUrl(`${BASE}/og.png`), width: 1200, height: 630, alt: t.ogAlt }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

/** 구조화 데이터. 화면에 있는 값과 같아야 한다 (다른 내용의 구조화 데이터는 없느니만 못하다). */
export function toolJsonLd({ lang, path = '', title, description }: PageMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    url: absoluteUrl(localizePath(lang, path)),
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: lang,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0' },
    publisher: { '@type': 'Organization', name: 'prelaps', url: 'https://prelaps.com/' },
    description,
  };
}

/**
 * 언어별 주소 만들기. **사전(locales/*.json)을 import 하지 않는다** —
 * 클라이언트 컴포넌트(LanguageSwitcher)도 이 파일을 쓰므로, 여기서 사전을 부르면
 * 세 언어 글이 전부 JS 번들에 실린다.
 */
import { BASE, LOCALES, SITE, XDEFAULT_LOCALE, type Locale } from './config';

/**
 * 언어 없는 경로 → basePath 를 포함한 실제 경로. 끝 슬래시를 붙이지 않는다.
 *   localizePath('ko')            → '/imageviewer/ko'
 *   localizePath('ja', '/guide')  → '/imageviewer/ja/guide'
 *
 * <a href> 에 그대로 쓴다. next/link 의 href 에 넣으면 basePath 가 한 번 더 붙는다.
 */
export function localizePath(lang: Locale, path = ''): string {
  return `${BASE}/${lang}${path}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE).href;
}

/**
 * 한 페이지가 가져야 할 hreflang 전체 목록. **모든 언어판이 같은 목록을 갖는다** —
 * 하나라도 빠지면 구글이 통째로 무시한다. x-default 는 영어.
 */
export function hreflangMap(path = ''): Record<string, string> {
  const map: Record<string, string> = {};
  for (const lang of LOCALES) map[lang] = absoluteUrl(localizePath(lang, path));
  map['x-default'] = absoluteUrl(localizePath(XDEFAULT_LOCALE, path));
  return map;
}

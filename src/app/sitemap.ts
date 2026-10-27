/**
 * → out/sitemap.xml  (= https://prelaps.com/imageviewer/sitemap.xml)
 * 허브 public/robots.txt 에 이 주소를 한 줄 적어야 읽힌다. 도구 안의 robots.txt 는 아무도 안 본다.
 *
 * 언어 없는 /imageviewer 은 302 통로라 넣지 않는다. 404 도 뺀다.
 * URL 은 basePath 가 붙지 않으므로 전체 주소로 적는다 (absoluteUrl).
 */
import type { MetadataRoute } from 'next';
import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { LOCALES } from '@/i18n/config';
import { absoluteUrl, hreflangMap, localizePath } from '@/i18n/paths';

export const dynamic = 'force-static';

/**
 * 페이지 소스가 마지막으로 바뀐 날. 여러 개를 주면 가장 최근. (doceditor astro.config 와 같은 규칙)
 *
 * ⚠ 빌드 시각(new Date())을 쓰면 안 된다. 배포할 때마다 전 페이지가 「오늘 바뀜」이
 *   되고, 구글은 그게 사실이 아닌 것을 알아채면 **이 사이트의 lastmod 를 통째로 무시한다.**
 * 커밋 안 된 수정이 있는 파일은 파일 수정 시각을 쓴다. git 을 못 쓰면 undefined —
 * 틀린 날짜보다 없는 편이 낫다.
 */
function lastmodOf(...files: string[]): Date | undefined {
  let newest: Date | undefined;
  for (const f of files) {
    let iso = '';
    try {
      const dirty = execSync(`git status --porcelain -- "${f}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      iso = dirty
        ? statSync(f).mtime.toISOString().slice(0, 10)
        : execSync(`git log -1 --format=%cs -- "${f}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      iso = '';
    }
    const d = iso ? new Date(iso + 'T00:00:00Z') : undefined;
    if (d && (!newest || d > newest)) newest = d;
  }
  return newest;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((lang) => ({
    url: absoluteUrl(localizePath(lang)),
    // 화면 글은 i18n/main.ts 에 있으므로 그쪽도 같이 본다.
    lastModified: lastmodOf('src/app/[lang]/page.tsx', 'src/i18n/main.ts'),
    alternates: { languages: hreflangMap() },
  }));
}

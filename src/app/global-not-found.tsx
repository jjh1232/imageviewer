/**
 * 없는 주소 → out/404.html. noindex · canonical 없음 (헌법 §7).
 * wrangler 의 not_found_handling: "404-page" 가 이 파일을 status 404 로 돌려준다.
 * 이게 없으면 없는 주소가 정상 페이지로 색인되는 soft 404 가 된다 — **지우지 말 것.**
 *
 * 루트 레이아웃이 [lang] · editor 안에 있어서 일반 not-found.tsx 는 둘 곳이 없다.
 * 그래서 <html> 부터 직접 그리는 global-not-found 다 (next.config 의 experimental.globalNotFound).
 * 어느 언어로 왔는지 모르므로 세 언어 안내를 둔다.
 */
import type { Metadata } from 'next';
import '@/styles/global.css';
import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import { localizePath } from '@/i18n/paths';
import { getDictionary } from '@/i18n/main';

const t = getDictionary('en');

export const metadata: Metadata = {
  title: `${t.notfound.title} | prelaps`,
  description: t.notfound.body,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <header>
            <div>
              <a className="home" href="/en">prelaps</a>
              <h1>{t.notfound.title}</h1>
            </div>
          </header>
          <section className="about">
            {LOCALES.map((l) => (
              <p key={l} lang={l}>
                <a href={localizePath(l)}>{LOCALE_LABELS[l]}</a> — {getDictionary(l).notfound.body}
              </p>
            ))}
          </section>
        </div>
      </body>
    </html>
  );
}

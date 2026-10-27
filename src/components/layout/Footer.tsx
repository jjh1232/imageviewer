/**
 * 소개 화면 공통 푸터. 정책은 허브에 하나씩 (헌법 §8).
 * #imageviewer 는 허브 privacy 의 서비스별 블록 id 와 같아야 한다.
 */
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/main';

export default function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).footer;
  return (
    <footer>
      <a href={`/${lang}`}>{t.home}</a>{' · '}
      <a href={`/${lang}/privacy#imageviewer`}>{t.privacy}</a>{' · '}
      <a href={`/${lang}/terms`}>{t.terms}</a>{' · '}
      <a href={`/${lang}/contact`}>{t.contact}</a>
    </footer>
  );
}

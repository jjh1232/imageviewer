import type { NextConfig } from "next";

/**
 * imageviewer — prelaps.com/imageviewer 아래의 도구. (헌법 §4 「새 도구는 Next.js 정적 내보내기로」)
 *
 * ⚠ 아래 세 줄 + wrangler 의 html_handling 이 세트다. 한쪽만 바꾸면
 *   canonical 이 가리키는 주소가 리다이렉트되는 주소가 된다.
 *     output 'export'      서버 없음. out/ 에 순수 HTML 이 나온다
 *     basePath             자산 경로(/imageviewer/_next/…)와 <Link> 에 붙는다.
 *                          ⚠ metadata 의 canonical·hreflang 에는 안 붙는다 — 그쪽은 lib/seo.ts 가 전체 주소를 만든다
 *     trailingSlash false  /imageviewer/ko → out/ko.html
 *
 * 서버 기능(middleware · Server Actions · route handler · rewrites · headers · ISR)은 export 에서 안 된다.
 * 루트 /imageviewer 의 언어 302 는 worker/index.js 가 한다.
 */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/imageviewer',
  trailingSlash: false,

  // 기본 이미지 최적화는 서버가 필요하다. export 에서는 끈다.
  images: { unoptimized: true },

  // app/global-not-found.tsx → out/404.html. 루트 레이아웃이 [lang] · editor 안에 있어서
  // 일반 not-found 는 둘 곳이 없다. 이게 없으면 404.html 이 안 생겨 soft 404 가 된다.
  experimental: { globalNotFound: true },

  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;

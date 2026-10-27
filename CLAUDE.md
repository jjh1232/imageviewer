# imageviewer — 만화·웹툰 이미지 뷰어 (prelaps.com/imageviewer)

Next.js 정적 내보내기(`output: 'export'`)로 만든 도구다 (헌법 §4 「새 도구는 Next.js 로」).
도메인 공통 규칙은 `D:\SUBsite\CLAUDE.md`, 원본은 `Main/prelaps-home/docs/prelaps-architecture.md`.
틀은 `nextjs-template` 에서 옮겨 왔다(2026-10-27). 원래 도메인 밖 개인 프로젝트였다.

```
npm run dev        개발 서버 — localhost:3000/imageviewer/ko · /imageviewer/editor
                   Worker 가 없어 루트 302·GA 주입은 안 보인다
npm run build      next build → out/ + scripts/check-out.mjs (실패하면 배포하지 말 것)
npm run preview    wrangler dev — 실제와 같게 보려면 npx wrangler dev --local-upstream prelaps.com
npm run deploy     build + wrangler deploy
npm run og         scripts/og.html → public/og.png
```

## 주소

```
/imageviewer          통로. Accept-Language 로 302 (worker)
/imageviewer/ko …     소개 — 사용법 + 사용 예시. 색인 대상. 루트 레이아웃 app/[lang]/layout.tsx
/imageviewer/editor   뷰어 앱. 언어가 주소에 없다(i18n/EditorLang). noindex · 애드센스 없음
                      루트 레이아웃 app/(pages)/(Nolayouts)/editor/layout.tsx — 색은 app/globals.css
```

템플릿과 다른 점: 도구 본체가 소개 페이지에 없고 /editor 에 따로 있다(화면을 꽉 채우는 앱).
그래서 루트 레이아웃이 둘이다. CSS 는 둘 다 `app/globals.css`(뷰어 변수, 값만 토스풍)를 쓰고 소개에 `[lang]/main.css` 를 더한다.

**소개 화면은 템플릿 얼굴(헌법 §12)을 쓰지 않는다 — 사용자 결정(2026-10-27).** 템플릿 헤더·카드로 올렸다가
「왜 디자인이 바뀌었냐」 며 예전 디자인으로 되돌렸다. 머리의 이름 자리에 허브 링크 「prelaps」, 바닥에 허브 정책 링크만 남긴다.
다시 템플릿 얼굴로 「맞추지」 말 것. `styles/global.css` 는 404 만 쓴다.

## 세트로 움직이는 것

```
next.config.ts   output 'export' · basePath '/imageviewer' · trailingSlash false
wrangler.jsonc   assets.directory './out' · html_handling 'drop-trailing-slash'
src/i18n/config.ts  BASE · LOCALES      ←→  worker/index.js  PREFIX · LANGS
뷰어 버튼 이름(i18n/editor.ts)  ←→  소개 설명문(i18n/main.ts 「사용법」)
```

## 이 스택에서 조심할 것

- **서버 기능은 없다.** 예전의 `/api/images`(파일을 개발 서버에 올려 http 주소를 받던 것)는 뺐다.
  파일로 연 사진은 blob: 주소다 — 브라우저 이미지 번역(웨일)이 blob: 에서 무한 로딩에 빠지는 대가가 있다.
- **canonical · hreflang · og:url · sitemap 은 `lib/seo.ts` · `i18n/paths.ts` 로만 만든다.** Next 는 metadata 에 basePath 를 안 붙인다.
- **클라이언트 코드의 절대 경로에는 basePath 가 안 붙는다.** `fetch('/x')` · `<a href="/x">` 는 도메인 루트로 간다.
  `location.pathname` 은 basePath 를 포함하므로 공유 링크는 그대로 맞다.
- **`i18n/main.ts`(소개 글)는 서버 컴포넌트에서만.** 뷰어(클라이언트)는 `i18n/editor.ts` · `i18n/config.ts` 만 부른다.
- 사진에 pointer-events:none · transform 금지(번역·우클릭 저장이 죽는다). 단축키는 `e.code` 로 본다.

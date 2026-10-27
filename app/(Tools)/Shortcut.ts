/* ── 바로가기 파일 ──────────────────────────────────────────
 *
 * 주소로 불러온 것을 다시 여는 .html 파일. 사진이 아니라 공유 링크(UrlBar 머리말)만 담는다 —
 * 원본 사이트가 저장을 막아도 상관없다. 더블클릭하면 뷰어가 열려 바로 불러온다.
 */

/** 링크로 옮겨 주는 작은 html. 스크립트가 꺼져 있어도 meta refresh 와 눌러서 가는 링크가 남는다. */
export function shortcutHtml(link: string, title: string): string {
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta http-equiv="refresh" content="0; url=${esc(link)}">
<script>location.replace(${JSON.stringify(link).replace(/</g, "\\u003c")})</script>
</head><body><a href="${esc(link)}">${esc(title)} 열기</a></body></html>
`;
}

/** 윈도우가 못 쓰는 글자를 _ 로. */
export const safeName = (t: string) => t.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/[. ]+$/, "").slice(0, 80);

export function downloadShortcut(link: string, title: string) {
    const name = safeName(title) || "바로가기";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([shortcutHtml(link, name)], { type: "text/html" }));
    a.download = `${name}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
}

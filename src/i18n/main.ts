/**
 * 소개 화면(/imageviewer/ko …) · 헤더 · 푸터 · 404 의 글. 템플릿의 locales/*.json 자리다.
 * 사용법·예시가 줄 목록이라 json 대신 타입 있는 사전으로 둔다 — 키가 빠지면 tsc 가 잡는다.
 * 서버 컴포넌트에서만 읽는다 — 클라이언트에서 import 하면 세 언어가 전부 번들에 실린다.
 * 뷰어(/imageviewer/editor) 화면 글은 editor.ts 다.
 */
import type { Locale } from "./config";

type Section = { h: string; items: string[] };

type Dictionary = {
    /** 검색어로 짓는다(헌법 §7 콘텐츠). <h1> · <title> 앞부분 */
    title: string;
    /** <title> 의 「제목 — 꼬리 | prelaps」 꼬리 */
    titleTail: string;
    tagline: string;
    metaDescription: string;
    ogAlt: string;
    open: string;
    langLabel: string;
    toLight: string;
    toDark: string;
    lead: string;
    how: Section;
    examples: Section;
    footer: { home: string; privacy: string; terms: string; contact: string };
    notfound: { title: string; body: string };
    noscript: string;
};

const ko: Dictionary = {
    title: "온라인 만화·웹툰 뷰어",
    titleTail: "이미지 여러 장 이어 보기",
    tagline: "만화·웹툰·스캔본을 이어 보는 이미지 뷰어",
    metaDescription:
        "여러 장으로 나뉜 만화·웹툰·스캔본을 한 장씩, 두 장 펼침으로, 세로로 이어서 보는 이미지 뷰어. 번호가 붙은 이미지 주소를 한꺼번에 열 수 있습니다.",
    ogAlt: "prelaps 온라인 만화·웹툰 뷰어",
    open: "뷰어 열기",
    langLabel: "언어",
    toLight: "밝은 화면으로",
    toDark: "어두운 화면으로",
    lead: "여러 장으로 나뉜 만화·웹툰·스캔본을 한 화면에서 이어 보는 이미지 뷰어입니다. 한 장씩, 두 장 펼침으로, 세로로 이어서 볼 수 있습니다.",
    how: {
        h: "사용법",
        items: [
            "불러오기 — 파일을 고르거나 끌어다 놓습니다. 「주소로 불러오기」에서는 주소의 바뀌는 부분을 {1} 칸으로 지정해 여러 장을 한꺼번에 엽니다. 다 봤으면 「비우기」로 한 번에 뺍니다.",
            "칸에 넣는 값 — 숫자 범위 1..54 · 자릿수 맞춤 001..100 · 알파벳 범위 a..z · 쉼표로 하나씩 red, blue, abc. 섞어 써도 됩니다(1..10, 20).",
            "보기 — 싱글 / 더블 / 웹툰 / 목록 중에서 고릅니다. 목록은 전부를 바둑판으로 깔아 보여 주고, 한 장을 누르면 그 장부터 이어서 읽습니다.",
            "크기 — 100% 는 원본 크기, 「맞춤」(F) 은 화면에 꽉 맞춥니다. Ctrl+휠, +/−, 숫자 입력으로 조절합니다.",
            "넘기기 — ← →, 휠, 화면 양옆의 < > 버튼. 확대한 상태에서는 끌어서 이동합니다.",
            "다시 열기 — 주소로 불러오면 「링크 복사」로 같은 화면을 여는 링크를 보낼 수 있고, 「바로가기 저장」으로 .html 파일을 받아 두면 나중에 그 파일을 열어 다시 불러옵니다. 이미지가 아니라 불러오는 방법만 담깁니다.",
            "단축키 — ← → 넘기기 · F 맞춤 · L 파일 목록 열기/닫기 · Esc 뒤로(목록이나 파일 목록에서 장을 골라 건너뛰기 전 화면으로).",
        ],
    },
    examples: {
        h: "사용 예시",
        items: [
            "받아 둔 만화 폴더를 통째로 넣고 두 장 펼침으로 책처럼 읽기",
            "page_001.jpg ~ page_120.jpg 처럼 번호가 붙은 이미지 주소를 한 번에 열어 웹툰처럼 내려 보기",
            "회차별로 몇백 장을 불러온 뒤 목록에서 원하는 회차·장을 골라 바로 들어가기",
            "보던 연재의 주소 범위를 바로가기로 저장해 두고, 다음에 그 파일만 열어 이어 보기",
        ],
    },
    footer: { home: "prelaps 홈", privacy: "개인정보처리방침", terms: "이용약관", contact: "문의" },
    notfound: { title: "페이지를 찾을 수 없습니다", body: "주소가 바뀌었거나 없는 페이지입니다." },
    noscript: "이 도구는 브라우저에서 동작하기 때문에 자바스크립트가 필요합니다.",
};

const en: Dictionary = {
    title: "Online Comic & Webtoon Viewer",
    titleTail: "Read image sequences in your browser",
    tagline: "An image viewer for comics, webtoons and scans",
    metaDescription:
        "Read comics, webtoons and scans split into many files one page at a time, as two-page spreads, or as one vertical strip. Open a whole numbered series of image URLs at once.",
    ogAlt: "prelaps online comic & webtoon viewer",
    open: "Open the viewer",
    langLabel: "Language",
    toLight: "Switch to light",
    toDark: "Switch to dark",
    lead: "An image viewer for comics, webtoons and scans split into many files. Read them one page at a time, as a two-page spread, or as one continuous vertical strip.",
    how: {
        h: "How to use",
        items: [
            "Open — pick files or drag them in. With \"Open from URL\", mark the changing part of an address as a {1} slot to open a whole numbered series at once. When you're done, \"Clear\" removes everything at once.",
            "Slot values — number ranges 1..54 · zero-padded 001..100 · letter ranges a..z · a list separated by commas: red, blue, abc. You can mix them (1..10, 20).",
            "View — choose Single, Double, Webtoon or Grid. Grid lays every page out as thumbnails; click one to keep reading from that page.",
            "Size — 100% is the original size, \"Fit\" (F) fills the screen. Adjust with Ctrl+wheel, +/−, or by typing a number.",
            "Navigate — ← →, the mouse wheel, or the < > buttons at the sides. When zoomed in, drag to move around.",
            "Reopen — after opening from a URL, \"Copy link\" gives a link that opens the same view, and \"Save shortcut\" downloads an .html file that loads it again later. Only the way to load the images is saved, not the images themselves.",
            "Shortcuts — ← → turn pages · F fit · L show/hide the file list · Esc go back (to where you were before jumping to a page from the grid or the file list).",
        ],
    },
    examples: {
        h: "Examples",
        items: [
            "Drop a downloaded comic folder in and read it as two-page spreads, like a book",
            "Open numbered image URLs such as page_001.jpg – page_120.jpg in one go and scroll through them like a webtoon",
            "Load hundreds of pages across several chapters, then pick a chapter and page from the grid and jump straight in",
            "Save the URL range of a series you're reading as a shortcut, and open just that file next time to carry on",
        ],
    },
    footer: { home: "prelaps home", privacy: "Privacy policy", terms: "Terms", contact: "Contact" },
    notfound: { title: "Page not found", body: "The address has changed or the page doesn't exist." },
    noscript: "This tool runs in your browser, so JavaScript is required.",
};

const ja: Dictionary = {
    title: "オンライン漫画・ウェブトゥーンビューア",
    titleTail: "連番画像をブラウザで続けて読む",
    tagline: "漫画・ウェブトゥーン・スキャン画像を続けて読む画像ビューア",
    metaDescription:
        "何枚にも分かれた漫画・ウェブトゥーン・スキャン画像を、1枚ずつ・見開き・縦スクロールで読める画像ビューア。連番画像のURLをまとめて開けます。",
    ogAlt: "prelaps オンライン漫画・ウェブトゥーンビューア",
    open: "ビューアを開く",
    langLabel: "言語",
    toLight: "ライトモードへ",
    toDark: "ダークモードへ",
    lead: "何枚にも分かれた漫画・ウェブトゥーン・スキャン画像を、ひとつの画面で続けて読むための画像ビューアです。1枚ずつ、見開き、縦スクロールで表示できます。",
    how: {
        h: "使い方",
        items: [
            "読み込み — ファイルを選ぶか、ドラッグ&ドロップします。「URLから読み込む」では、URLの変わる部分を {1} 枠にして連番画像をまとめて開けます。読み終えたら「クリア」でまとめて外せます。",
            "枠に入れる値 — 数字の範囲 1..54 ・桁そろえ 001..100 ・アルファベットの範囲 a..z ・カンマ区切りで一つずつ red, blue, abc。混ぜて書けます(1..10, 20)。",
            "表示 — シングル / 見開き / 縦読み / 一覧 から選びます。一覧では全ページをタイル状に並べ、1枚をクリックするとそのページから続けて読めます。",
            "サイズ — 100% は原寸、「フィット」(F) は画面いっぱいに合わせます。Ctrl+ホイール、+/−、数値入力で調整できます。",
            "ページ送り — ← →、ホイール、画面左右の < > ボタン。拡大中はドラッグで移動します。",
            "もう一度開く — URLから読み込んだあと、「リンクをコピー」で同じ画面を開くリンクを送れます。「ショートカット保存」で .html ファイルを保存しておけば、あとでそのファイルを開くだけで読み込み直せます。保存されるのは画像ではなく、読み込み方だけです。",
            "ショートカットキー — ← → ページ送り ・ F フィット ・ L ファイル一覧の表示/非表示 ・ Esc 戻る(一覧やファイル一覧からページを選んで移動する前の画面へ)。",
        ],
    },
    examples: {
        h: "使用例",
        items: [
            "ダウンロードした漫画フォルダをまとめて入れ、見開きで本のように読む",
            "page_001.jpg〜page_120.jpg のような連番URLを一度に開き、縦読みでスクロールする",
            "話ごとに数百枚を読み込み、一覧から読みたい話・ページを選んですぐに入る",
            "読んでいる連載のURL範囲をショートカットに保存し、次回はそのファイルを開くだけで続きを読む",
        ],
    },
    footer: { home: "prelaps ホーム", privacy: "プライバシーポリシー", terms: "利用規約", contact: "お問い合わせ" },
    notfound: { title: "ページが見つかりません", body: "アドレスが変わったか、存在しないページです。" },
    noscript: "このツールはブラウザで動作するため、JavaScript が必要です。",
};

const dictionaries: Record<Locale, Dictionary> = { ko, en, ja };

export function getDictionary(lang: Locale): Dictionary {
    return dictionaries[lang];
}

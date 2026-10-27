/**
 * 메인(소개) 화면 글. 언어를 늘리는 곳은 LOCALES 와 아래 사전 한 벌.
 * 서버 컴포넌트에서만 읽는다 — 클라이언트에서 import 하면 세 언어가 전부 번들에 실린다.
 */
export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

/** 언어를 특정하지 못한 방문자를 보낼 곳. hreflang x-default 와 같은 값. */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
};

export function isLocale(value: string): value is Locale {
    return (LOCALES as readonly string[]).includes(value);
}

type Section = { h: string; items: string[] };

type Dictionary = {
    name: string;
    tagline: string;
    metaTitle: string;
    metaDescription: string;
    open: string;
    lead: string;
    how: Section;
    examples: Section;
};

const ko: Dictionary = {
    name: "WebImageViewer",
    tagline: "만화·웹툰·스캔본을 이어 보는 이미지 뷰어",
    metaTitle: "WebImageViewer — 만화·웹툰 이미지 뷰어",
    metaDescription:
        "여러 장으로 나뉜 만화·웹툰·스캔본을 한 장씩, 두 장 펼침으로, 세로로 이어서 보는 이미지 뷰어. 번호가 붙은 이미지 주소를 한꺼번에 열 수 있습니다.",
    open: "이미지 뷰어 열기",
    lead: "여러 장으로 나뉜 만화·웹툰·스캔본을 한 화면에서 이어 보는 이미지 뷰어입니다. 한 장씩, 두 장 펼침으로, 세로로 이어서 볼 수 있습니다.",
    how: {
        h: "사용법",
        items: [
            "불러오기 — 파일을 고르거나 끌어다 놓습니다. 「주소로 불러오기」에서는 주소의 바뀌는 부분을 {1} 칸으로 지정해 여러 장을 한꺼번에 엽니다.",
            "칸에 넣는 값 — 숫자 범위 1..54 · 자릿수 맞춤 001..100 · 알파벳 범위 a..z · 쉼표로 하나씩 red, blue, abc. 섞어 써도 됩니다(1..10, 20).",
            "보기 — 싱글 / 더블 / 웹툰 중에서 고릅니다.",
            "크기 — 100% 는 원본 크기, 「맞춤」(F) 은 화면에 꽉 맞춥니다. Ctrl+휠, +/−, 숫자 입력으로 조절합니다.",
            "넘기기 — ← → 또는 휠. 확대한 상태에서는 끌어서 이동합니다.",
        ],
    },
    examples: {
        h: "사용 예시",
        items: [
            "받아 둔 만화 폴더를 통째로 넣고 두 장 펼침으로 책처럼 읽기",
            "page_001.jpg ~ page_120.jpg 처럼 번호가 붙은 이미지 주소를 한 번에 열어 웹툰처럼 내려 보기",
        ],
    },
};

const en: Dictionary = {
    name: "WebImageViewer",
    tagline: "An image viewer for comics, webtoons and scans",
    metaTitle: "WebImageViewer — Comic & Webtoon Image Viewer",
    metaDescription:
        "Read comics, webtoons and scans split into many files one page at a time, as two-page spreads, or as one vertical strip. Open a whole numbered series of image URLs at once.",
    open: "Open the image viewer",
    lead: "An image viewer for comics, webtoons and scans split into many files. Read them one page at a time, as a two-page spread, or as one continuous vertical strip.",
    how: {
        h: "How to use",
        items: [
            "Open — pick files or drag them in. With \"Open from URL\", mark the changing part of an address as a {1} slot to open a whole numbered series at once.",
            "Slot values — number ranges 1..54 · zero-padded 001..100 · letter ranges a..z · a list separated by commas: red, blue, abc. You can mix them (1..10, 20).",
            "View — choose Single, Double or Webtoon.",
            "Size — 100% is the original size, \"Fit\" (F) fills the screen. Adjust with Ctrl+wheel, +/−, or by typing a number.",
            "Navigate — ← → or the mouse wheel. When zoomed in, drag to move around.",
        ],
    },
    examples: {
        h: "Examples",
        items: [
            "Drop a downloaded comic folder in and read it as two-page spreads, like a book",
            "Open numbered image URLs such as page_001.jpg – page_120.jpg in one go and scroll through them like a webtoon",
        ],
    },
};

const ja: Dictionary = {
    name: "WebImageViewer",
    tagline: "漫画・ウェブトゥーン・スキャン画像を続けて読む画像ビューア",
    metaTitle: "WebImageViewer — 漫画・ウェブトゥーン画像ビューア",
    metaDescription:
        "何枚にも分かれた漫画・ウェブトゥーン・スキャン画像を、1枚ずつ・見開き・縦スクロールで読める画像ビューア。連番画像のURLをまとめて開けます。",
    open: "画像ビューアを開く",
    lead: "何枚にも分かれた漫画・ウェブトゥーン・スキャン画像を、ひとつの画面で続けて読むための画像ビューアです。1枚ずつ、見開き、縦スクロールで表示できます。",
    how: {
        h: "使い方",
        items: [
            "読み込み — ファイルを選ぶか、ドラッグ&ドロップします。「URLから読み込む」では、URLの変わる部分を {1} 枠にして連番画像をまとめて開けます。",
            "枠に入れる値 — 数字の範囲 1..54 ・桁そろえ 001..100 ・アルファベットの範囲 a..z ・カンマ区切りで一つずつ red, blue, abc。混ぜて書けます(1..10, 20)。",
            "表示 — シングル / 見開き / 縦読み から選びます。",
            "サイズ — 100% は原寸、「フィット」(F) は画面いっぱいに合わせます。Ctrl+ホイール、+/−、数値入力で調整できます。",
            "ページ送り — ← → またはホイール。拡大中はドラッグで移動します。",
        ],
    },
    examples: {
        h: "使用例",
        items: [
            "ダウンロードした漫画フォルダをまとめて入れ、見開きで本のように読む",
            "page_001.jpg〜page_120.jpg のような連番URLを一度に開き、縦読みでスクロールする",
        ],
    },
};

const dictionaries: Record<Locale, Dictionary> = { ko, en, ja };

export function getDictionary(lang: Locale): Dictionary {
    return dictionaries[lang];
}

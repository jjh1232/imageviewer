import type { Locale } from "./locales";

/*
 * 뷰어(/editor) 화면 글. 메인 사전(main.ts)과 따로 둔다 — 이건 클라이언트에 실린다.
 * 버튼 이름은 메인 설명문(main.ts 「사용법」)이 그대로 부르므로, 바꾸면 거기도 맞춘다.
 * 숫자가 들어가는 글은 함수다.
 */
export type EditorDict = {
    language: string;
    toLight: string;
    toDark: string;

    // 위 막대
    modes: { single: string; double: string; webtoon: string; grid: string };
    fileList: string;
    showFileList: string;
    hideFileList: string;
    back: string;
    openFiles: string;
    openUrl: string;
    saveShortcut: string;
    saveShortcutTitle: string;
    saveShortcutOff: string;
    clear: string;
    clearTitle: string;
    clearConfirm: (n: number) => string;

    // 바로가기 파일
    shortcutName: string;
    shortcutOpen: (title: string) => string;

    // 보기
    count: (n: number) => string;
    emptyViewer: string;
    emptyList: string[];
    removeFromList: string;
    prevPage: string;
    nextPage: string;
    imageAlt: (n: number) => string;
    gridAll: string;

    // 아래 막대
    prev: string;
    next: string;
    zoomOut: string;
    zoomIn: string;
    size: string;
    zoomPercent: string;
    fit: string;
    fitTitle: string;

    // 주소로 불러오기
    quote: (name: string) => string;
    slotName: string;
    slotValue: (name: string) => string;
    slotValueHelp: string;
    insertName: string;
    removeSlot: string;
    addSlot: string;
    urlLabel: string;
    urlHintNames: (names: string) => string;
    urlHint: string;
    needName: string;
    needValue: (name: string) => string;
    notInUrl: (name: string) => string;
    needHttp: string;
    intro: string;
    tooMany: (total: number, max: number) => string;
    summaryGroups: (total: number, groups: number, stop: number) => string;
    example: string;
    added: (n: number) => string;
    noneOpened: string;
    kept: (kept: number, dropped: number) => string;
    badLink: string;
    copied: string;
    copyFailed: (link: string) => string;
    copyLink: string;
    copyLinkTitle: string;
    load: string;
    // 값 칸 읽기 오류(UrlSequence.parseValues)
    parse: { empty: string; case: string; tooMany: (max: number) => string };
};

const ko: EditorDict = {
    language: "언어",
    toLight: "밝은 화면으로",
    toDark: "어두운 화면으로",

    modes: { single: "싱글", double: "더블", webtoon: "웹툰", grid: "목록" },
    fileList: "파일 목록",
    showFileList: "파일 목록 열기 (L)",
    hideFileList: "파일 목록 닫기 (L)",
    back: "뒤로",
    openFiles: "파일 열기",
    openUrl: "주소로 불러오기",
    saveShortcut: "바로가기 저장",
    saveShortcutTitle: "마지막으로 주소로 불러온 것을 다시 여는 .html 파일을 내려받습니다 — 사진은 담기지 않습니다",
    saveShortcutOff: "주소로 불러온 뒤에 쓸 수 있습니다",
    clear: "비우기",
    clearTitle: "불러온 사진을 모두 뺍니다",
    clearConfirm: (n) => `${n}장 모두 비우기?`,

    shortcutName: "바로가기",
    shortcutOpen: (t) => `${t} 열기`,

    count: (n) => `${n}장`,
    emptyViewer: "위에서 파일이나 주소로 이미지를 불러오세요.",
    emptyList: ["이미지가 없습니다.", "위의 「파일 열기」나 주소로 불러오거나", "여기에 끌어다 놓으세요."],
    removeFromList: "목록에서 지우기",
    prevPage: "이전 장",
    nextPage: "다음 장",
    imageAlt: (n) => `이미지 ${n}`,
    gridAll: "전체",

    prev: "이전",
    next: "다음",
    zoomOut: "작게",
    zoomIn: "크게",
    size: "크기",
    zoomPercent: "배율(%)",
    fit: "맞춤",
    fitTitle: "보기 영역에 꽉 맞는 최대 크기로 (F)",

    quote: (n) => `「${n}」`,
    slotName: "칸 이름",
    slotValue: (n) => `${n || "칸"} 값`,
    slotValueHelp: "하나: MAHORA/JYH1 · 숫자 범위: 1..54 · 001..100 · 알파벳 범위: a..z · aa..zz · 단어 여러 개: happy, sad, angry",
    insertName: "이 이름을 주소에 넣기",
    removeSlot: "칸 지우기",
    addSlot: "+ 바꿀 부분",
    urlLabel: "주소",
    urlHintNames: (names) => `— 바꿀 자리에 ${names} 를 그대로`,
    urlHint: "— 바꿀 자리에 칸 이름을 그대로",
    needName: "칸 이름을 넣으세요",
    needValue: (n) => `「${n}」 의 값을 넣으세요`,
    notInUrl: (n) => `「${n}」 가 주소에 없습니다 — 바꿀 자리에 그대로 적으세요`,
    needHttp: "http 로 시작하는 이미지 주소를 넣으세요.",
    intro: "바뀌는 부분마다 칸을 만들고, 주소의 그 자리에 칸 이름을 적으세요.",
    tooMany: (total, max) => `${total}장 — 한 번에 ${max}장까지입니다.`,
    summaryGroups: (total, groups, stop) => `${total}장 · ${groups}묶음 · 묶음마다 연속 ${stop}장이 없으면 다음으로`,
    example: "예",
    added: (n) => `${n}장 넣음 · 안 열리는 번호를 빼는 중…`,
    noneOpened: "열리는 이미지가 없습니다. 주소와 값을 확인하세요.",
    kept: (k, d) => `${k}장${d ? ` (안 열리는 번호 ${d}개 뺌)` : ""}`,
    badLink: "링크의 주소를 읽지 못했습니다.",
    copied: "링크를 복사했습니다 — 받은 사람이 열면 같은 이미지를 불러옵니다.",
    copyFailed: (link) => `복사하지 못했습니다. 직접 복사하세요: ${link}`,
    copyLink: "링크 복사",
    copyLinkTitle: "지금 주소와 칸을 담은 링크를 복사합니다",
    load: "불러오기",
    parse: {
        empty: "값을 넣으세요",
        case: "범위 양끝의 대소문자를 맞추세요",
        tooMany: (max) => `한 번에 ${max}장까지입니다`,
    },
};

const en: EditorDict = {
    language: "Language",
    toLight: "Switch to light",
    toDark: "Switch to dark",

    modes: { single: "Single", double: "Double", webtoon: "Webtoon", grid: "Grid" },
    fileList: "File list",
    showFileList: "Show file list (L)",
    hideFileList: "Hide file list (L)",
    back: "Back",
    openFiles: "Open files",
    openUrl: "Open from URL",
    saveShortcut: "Save shortcut",
    saveShortcutTitle: "Download an .html file that reopens what you last loaded from a URL — the images themselves aren't saved",
    saveShortcutOff: "Available after loading from a URL",
    clear: "Clear",
    clearTitle: "Remove all loaded images",
    clearConfirm: (n) => `Clear all ${n}?`,

    shortcutName: "shortcut",
    shortcutOpen: (t) => `Open ${t}`,

    count: (n) => (n === 1 ? "1 image" : `${n} images`),
    emptyViewer: "Open images from files or a URL above.",
    emptyList: ["No images yet.", "Use “Open files” or a URL above,", "or drop them here."],
    removeFromList: "Remove from list",
    prevPage: "Previous page",
    nextPage: "Next page",
    imageAlt: (n) => `Image ${n}`,
    gridAll: "All",

    prev: "Prev",
    next: "Next",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    size: "Size",
    zoomPercent: "Zoom (%)",
    fit: "Fit",
    fitTitle: "Largest size that fits the view (F)",

    quote: (n) => `“${n}”`,
    slotName: "Slot name",
    slotValue: (n) => `Value of ${n || "slot"}`,
    slotValueHelp: "One value: MAHORA/JYH1 · number range: 1..54 · 001..100 · letter range: a..z · aa..zz · several words: happy, sad, angry",
    insertName: "Insert this name into the URL",
    removeSlot: "Remove slot",
    addSlot: "+ Changing part",
    urlLabel: "URL",
    urlHintNames: (names) => `— type ${names} where the address changes`,
    urlHint: "— type the slot name where the address changes",
    needName: "Enter a slot name",
    needValue: (n) => `Enter a value for “${n}”`,
    notInUrl: (n) => `“${n}” isn't in the URL — type it where the address changes`,
    needHttp: "Enter an image URL starting with http.",
    intro: "Make a slot for each part that changes, then type the slot name at that spot in the URL.",
    tooMany: (total, max) => `${total} images — up to ${max} at a time.`,
    summaryGroups: (total, groups, stop) => `${total} images · ${groups} groups · each group stops after ${stop} missing in a row`,
    example: "e.g.",
    added: (n) => `Added ${n} · removing numbers that don't open…`,
    noneOpened: "None of the images opened. Check the URL and values.",
    kept: (k, d) => `${k === 1 ? "1 image" : `${k} images`}${d ? ` (${d} that didn't open removed)` : ""}`,
    badLink: "Couldn't read the URL in this link.",
    copied: "Link copied — anyone who opens it loads the same images.",
    copyFailed: (link) => `Couldn't copy. Copy it yourself: ${link}`,
    copyLink: "Copy link",
    copyLinkTitle: "Copy a link with this URL and its slots",
    load: "Load",
    parse: {
        empty: "Enter a value",
        case: "Use the same letter case at both ends of the range",
        tooMany: (max) => `Up to ${max} images at a time`,
    },
};

const ja: EditorDict = {
    language: "言語",
    toLight: "ライトモードへ",
    toDark: "ダークモードへ",

    modes: { single: "シングル", double: "見開き", webtoon: "縦読み", grid: "一覧" },
    fileList: "ファイル一覧",
    showFileList: "ファイル一覧を開く (L)",
    hideFileList: "ファイル一覧を閉じる (L)",
    back: "戻る",
    openFiles: "ファイルを開く",
    openUrl: "URLから読み込む",
    saveShortcut: "ショートカット保存",
    saveShortcutTitle: "最後にURLから読み込んだものを開き直す .html ファイルを保存します — 画像そのものは含まれません",
    saveShortcutOff: "URLから読み込んだ後に使えます",
    clear: "クリア",
    clearTitle: "読み込んだ画像をすべて外します",
    clearConfirm: (n) => `${n}枚すべてクリア?`,

    shortcutName: "ショートカット",
    shortcutOpen: (t) => `${t} を開く`,

    count: (n) => `${n}枚`,
    emptyViewer: "上のボタンからファイルかURLで画像を読み込んでください。",
    emptyList: ["画像がありません。", "上の「ファイルを開く」かURLから読み込むか、", "ここにドラッグ&ドロップしてください。"],
    removeFromList: "一覧から削除",
    prevPage: "前のページ",
    nextPage: "次のページ",
    imageAlt: (n) => `画像 ${n}`,
    gridAll: "すべて",

    prev: "前へ",
    next: "次へ",
    zoomOut: "縮小",
    zoomIn: "拡大",
    size: "サイズ",
    zoomPercent: "倍率(%)",
    fit: "フィット",
    fitTitle: "表示領域いっぱいの最大サイズに (F)",

    quote: (n) => `「${n}」`,
    slotName: "枠の名前",
    slotValue: (n) => `${n || "枠"}の値`,
    slotValueHelp: "1つ: MAHORA/JYH1 · 数字の範囲: 1..54 · 001..100 · アルファベットの範囲: a..z · aa..zz · 複数の単語: happy, sad, angry",
    insertName: "この名前をURLに入れる",
    removeSlot: "枠を削除",
    addSlot: "+ 変える部分",
    urlLabel: "URL",
    urlHintNames: (names) => `— 変える位置に ${names} をそのまま`,
    urlHint: "— 変える位置に枠の名前をそのまま",
    needName: "枠の名前を入れてください",
    needValue: (n) => `「${n}」の値を入れてください`,
    notInUrl: (n) => `「${n}」がURLにありません — 変える位置にそのまま書いてください`,
    needHttp: "http で始まる画像URLを入れてください。",
    intro: "変わる部分ごとに枠を作り、URLのその位置に枠の名前を書いてください。",
    tooMany: (total, max) => `${total}枚 — 一度に${max}枚までです。`,
    summaryGroups: (total, groups, stop) => `${total}枚 · ${groups}グループ · 連続${stop}枚なければ次のグループへ`,
    example: "例",
    added: (n) => `${n}枚追加 · 開けない番号を外しています…`,
    noneOpened: "開ける画像がありません。URLと値を確認してください。",
    kept: (k, d) => `${k}枚${d ? `(開けない番号 ${d}個を除外)` : ""}`,
    badLink: "リンクのURLを読み取れませんでした。",
    copied: "リンクをコピーしました — 開いた人は同じ画像を読み込みます。",
    copyFailed: (link) => `コピーできませんでした。手動でコピーしてください: ${link}`,
    copyLink: "リンクをコピー",
    copyLinkTitle: "今のURLと枠を含むリンクをコピーします",
    load: "読み込む",
    parse: {
        empty: "値を入れてください",
        case: "範囲の両端の大文字・小文字をそろえてください",
        tooMany: (max) => `一度に${max}枚までです`,
    },
};

export const EDITOR_DICTS: Record<Locale, EditorDict> = { ko, en, ja };

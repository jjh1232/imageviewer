import type { ImageItem } from "./UserImageManager";

/* ── 번호가 붙은 주소 한꺼번에 불러오기 ─────────────────────────
 *
 * https://site.com/comic/ep3/001.webp ~ ep7/100.webp 처럼 숫자만 바뀌는 주소를
 * 하나씩 열어보기는 힘들다. 주소 하나를 받아 **숫자마다** 범위를 정하게 한다.
 *
 *   주소를 조각낸다      "…/ep" [3] "/" [001] ".webp"
 *   사용자가 고른 숫자마다 값 (1..100 · 1,3,7 · X,Y — parseValues)
 *   왼쪽 숫자가 바깥 반복  ep3 의 001~100 → ep4 의 001~100 → …
 *
 * 회차마다 장수가 다르므로 안쪽(맨 오른쪽 고른 숫자)은 넉넉히 잡게 하고,
 * 연속으로 STOP_AFTER 장이 안 열리면 그 회차를 끝낸다.
 *
 * 001 처럼 0 이 앞에 붙어 있으면 자릿수를 지킨다 (001, 002 … 100).
 */

/** 한 번에 만들 수 있는 최대 장수. 실수로 1~1000000 을 넣는 걸 막는다. */
export const MAX_COUNT = 3000;

/** 안쪽 범위에서 연속으로 이만큼 안 열리면 다음 바깥 번호로 넘어간다. */
export const STOP_AFTER = 5;

/** 동시에 열어볼 주소 수. 너무 많으면 상대 서버가 막는다. */
const CONCURRENCY = 6;

/** 한 장을 기다리는 최대 시간. */
const TIMEOUT_MS = 15000;

/** 주소 조각. 바꿀 수 없는 글자, 숫자 칸, 알파벳 칸 중 하나다. */
export type Piece =
    | { kind: "text"; text: string }
    | { kind: "num"; text: string; pad: number }
    | { kind: "word"; text: string };

/** 값 칸을 붙일 수 있는 조각인가. */
export const isSlot = (p: Piece) => p.kind !== "text";

/** 숫자 자리에 넣을 값. 숫자면 원래 자릿수를 지키고, 글자면 그대로 넣는다. */
export type Value = number | string;

/** 값 칸 하나를 읽은 결과. */
export type Parsed = { ok: true; values: Value[] } | { ok: false; reason: string };

/**
 * 값 칸을 읽는다. 쉼표로 여러 개를 이어 쓸 수 있다.
 *
 *   7            한 장
 *   1..239       범위 (1~239 도 된다). 거꾸로 쓰면 거꾸로 센다
 *   1,3,7        골라서
 *   1..10, 20    섞어서
 *   a..f         알파벳 범위. ab..ef 면 ab, ac … az, ba … ef (엑셀 열 이름처럼 센다)
 *   X, Y         글자 — 의상 코드처럼 숫자가 아닌 값도 넣을 수 있다
 *
 * 범위를 펼치기 전에 크기부터 본다. 1..1000000 을 배열로 만들지 않게.
 */
export function parseValues(text: string): Parsed {
    const tokens = text.split(",").map((t) => t.trim()).filter(Boolean);
    if (tokens.length === 0) return { ok: false, reason: "값을 넣으세요" };

    const values: Value[] = [];
    for (const token of tokens) {
        const w = token.match(/^([a-z]+|[A-Z]+)\s*(?:\.\.|~)\s*([a-z]+|[A-Z]+)$/);
        if (w) {
            const upper = w[1] === w[1].toUpperCase();
            if (upper !== (w[2] === w[2].toUpperCase())) return { ok: false, reason: "범위 양끝의 대소문자를 맞추세요" };
            const from = wordIndex(w[1]), to = wordIndex(w[2]);
            if (Math.abs(to - from) + 1 + values.length > MAX_COUNT) {
                return { ok: false, reason: `한 번에 ${MAX_COUNT}장까지입니다` };
            }
            const step = from <= to ? 1 : -1;
            for (let v = from; v !== to + step; v += step) values.push(indexWord(v, upper));
            continue;
        }

        const m = token.match(/^(\d+)\s*(?:\.\.|~)\s*(\d+)$/);
        if (!m) {
            values.push(/^\d+$/.test(token) ? Number(token) : token);
            continue;
        }
        const from = Number(m[1]), to = Number(m[2]);
        if (Math.abs(to - from) + 1 + values.length > MAX_COUNT) {
            return { ok: false, reason: `한 번에 ${MAX_COUNT}장까지입니다` };
        }
        const step = from <= to ? 1 : -1;
        for (let v = from; v !== to + step; v += step) values.push(v);
    }
    return { ok: true, values };
}

/* 알파벳 ↔ 번호. a=1 … z=26, aa=27 … — 엑셀 열 이름과 같은 셈법이라
   ab..ef 처럼 길이가 같으면 자리올림으로, a..zz 처럼 다르면 이어서 센다. */
function wordIndex(word: string): number {
    let n = 0;
    for (const ch of word.toLowerCase()) n = n * 26 + (ch.charCodeAt(0) - 96);
    return n;
}
function indexWord(n: number, upper: boolean): string {
    let out = "";
    while (n > 0) {
        const r = (n - 1) % 26;
        out = String.fromCharCode(97 + r) + out;
        n = Math.floor((n - 1) / 26);
    }
    return upper ? out.toUpperCase() : out;
}

/** %EC%BA%90 같은 인코딩을 풀어둔다. 안 풀면 그 안의 글자·숫자가 전부 칸으로 쪼개진다. */
function decode(url: string): string {
    try { return decodeURI(url); } catch { return url; }
}

/**
 * 주소를 조각낸다 — 경로·쿼리의 숫자 덩어리와 알파벳 덩어리가 칸이 된다.
 * 칸이 하나도 없으면 null.
 * 도메인(cdn2.site.com 같은)은 바꿀 일이 없으니 통째로 글자로 둔다.
 */
export function splitUrl(raw: string): Piece[] | null {
    const url = decode(raw.trim());
    const hostEnd = url.indexOf("/", url.indexOf("//") + 2);
    if (!/^https?:\/\//i.test(url) || hostEnd < 0) return null;

    const pieces: Piece[] = [{ kind: "text", text: url.slice(0, hostEnd) }];
    let last = hostEnd;
    for (const m of url.slice(hostEnd).matchAll(/\d+|[A-Za-z]+/g)) {
        const at = hostEnd + m.index!;
        if (at > last) pieces.push({ kind: "text", text: url.slice(last, at) });
        const t = m[0];
        pieces.push(/\d/.test(t)
            ? { kind: "num", text: t, pad: t.length > 1 && t.startsWith("0") ? t.length : 0 }
            : { kind: "word", text: t });
        last = at + t.length;
    }
    if (last < url.length) pieces.push({ kind: "text", text: url.slice(last) });

    return pieces.some(isSlot) ? pieces : null;
}

/** 처음에 켜 둘 숫자 — ? 앞(경로)의 마지막 숫자. 보통 파일 번호다. */
export function defaultPick(pieces: Piece[]): number {
    let pick = -1;
    let inQuery = false;
    pieces.forEach((p, i) => {
        if (p.kind === "text" && /[?#]/.test(p.text)) inQuery = true;
        if (p.kind === "num" && !inQuery) pick = i;
    });
    // 경로에 숫자가 없으면 쿼리의 첫 숫자라도.
    return pick >= 0 ? pick : pieces.findIndex((p) => p.kind === "num");
}

/** 값을 정한 숫자들로 만들어질 장수. 주소를 실제로 만들기 전에 상한을 본다. */
export function countOf(vars: Map<number, Value[]>): number {
    let n = 1;
    for (const v of vars.values()) n *= v.length;
    return n;
}

/**
 * 주소를 만든다. 결과는 **그룹 목록** — 바깥 숫자 조합 하나가 한 그룹이고,
 * 그 안에 가장 안쪽 숫자의 값만큼 주소가 들어 있다.
 * 값을 안 정한 숫자는 원래 값 그대로 둔다.
 */
export function buildGroups(pieces: Piece[], vars: Map<number, Value[]>): string[][] {
    const order = [...vars.keys()].sort((a, b) => a - b);   // 왼쪽이 바깥
    if (order.length === 0 || countOf(vars) > MAX_COUNT) return [];

    const inner = order.at(-1)!;
    const outer = order.slice(0, -1);

    const render = (chosen: Map<number, Value>) =>
        pieces.map((p, i) => {
            if (p.kind === "text" || !chosen.has(i)) return p.text;
            const v = chosen.get(i)!;
            return typeof v === "number" && p.kind === "num" ? String(v).padStart(p.pad, "0") : String(v);
        }).join("");

    // 바깥 숫자들의 모든 조합 (왼쪽이 천천히 바뀐다)
    let combos: Map<number, Value>[] = [new Map()];
    for (const i of outer) {
        combos = combos.flatMap((c) => vars.get(i)!.map((v) => new Map(c).set(i, v)));
    }

    return combos.map((c) => vars.get(inner)!.map((v) => render(new Map(c).set(inner, v))));
}

/** 실제로 그려지는지 본다. 404 나 그림이 아닌 응답이면 false. */
function probe(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => done(false), TIMEOUT_MS);
        function done(ok: boolean) {
            clearTimeout(timer);
            img.onload = img.onerror = null;
            resolve(ok);
        }
        img.onload = () => done(img.naturalWidth > 0);
        img.onerror = () => done(false);
        img.src = url;
    });
}

/** 주소의 경로 끝 두 칸을 제목으로 쓴다 (ep3/001.webp) — 회차가 섞여도 구분되게. */
function titleOf(url: string): string {
    try {
        const parts = new URL(url).pathname.split("/").filter(Boolean).slice(-2);
        return parts.length ? decodeURIComponent(parts.join("/")) : url;
    } catch {
        return url;
    }
}

/**
 * 그룹마다 앞에서부터 CONCURRENCY 장씩 열어보고, 열리는 것만 **원래 순서대로** 돌려준다.
 * 한 그룹 안에서 연속 STOP_AFTER 장이 안 열리면 그 그룹의 나머지는 건너뛴다.
 */
export async function loadGroups(
    groups: string[][],
    onProgress?: (found: number, checked: number) => void,
): Promise<{ items: ImageItem[]; checked: number }> {
    const found: string[] = [];
    let checked = 0;

    for (const urls of groups) {
        let misses = 0;
        for (let i = 0; i < urls.length && misses < STOP_AFTER; i += CONCURRENCY) {
            const batch = urls.slice(i, i + CONCURRENCY);
            const ok = await Promise.all(batch.map(probe));
            checked += batch.length;

            // 순서대로 세어야 「연속」 이 맞는다. 끊긴 뒤에 열린 장은 버리지 않는다.
            batch.forEach((url, k) => {
                if (ok[k]) { found.push(url); misses = 0; }
                else misses++;
            });
            onProgress?.(found.length, checked);
        }
    }

    const items = found.map((url) => ({
        id: crypto.randomUUID(),
        url,
        title: titleOf(url),
        size: 0,            // 남의 서버 그림이라 크기를 모른다. 목록에는 번호만 나온다.
        type: "",
    }));
    return { items, checked };
}

"use client"

import { useImages } from "@/app/(Context)/ImageProvider";
import { buildTemplateGroups, Cond, countConds, itemsFromGroups, MAX_COUNT, parseValues, pruneMissing, STOP_AFTER, templateGroupNames } from "@/app/(Tools)/UrlSequence";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

/* ── 주소로 불러오기 — 바꿀 부분을 칸으로 ──────────────────────
 *
 *   ┌ {1} ───────────┐ ┌ {2} ────────────────┐  [+ 바꿀 부분]
 *   │ MAHORA/JYH1    │ │ 1..54, 71..85       │
 *   └────────────────┘ └─────────────────────┘
 *   주소  https://ichio.org/{1}/{2}.webp
 *   69장 · 예: https://ichio.org/MAHORA/JYH1/1.webp                  [불러오기]
 *
 * 바뀌는 부분마다 칸을 하나씩 + 로 만든다. 칸은 「이름」 과 「값」 이다.
 * 주소에는 바꿀 자리에 그 이름을 그대로 적는다 — 그 자리가 값으로 바뀐다.
 *
 * 이름은 새 칸마다 {1} {2} … 로 저절로 붙는다. 「캐릭터」 「page」 처럼 말로 지으면
 * 주소 안의 다른 같은 글자까지 바뀔 수 있다(…/page/page1.webp). 중괄호 표시는 진짜 주소에
 * 나올 일이 없어서 그런 사고가 없다. 원하면 고쳐 써도 된다.
 * 값은 하나여도(MAHORA/JYH1 — / 가 들어가도 된다) 범위여도 된다
 * (1..54 · 001..100 · abc~bcd · X,Y — parseValues).
 * 주소에서 왼쪽에 있는 이름이 바깥 반복이다(캐릭터마다 1..54 를 돈다).
 *
 * 칸 이름 옆 「↓」 는 그 이름을 주소 칸의 커서 자리에 끼워 넣는다 — 손으로 안 쳐도 되게.
 *
 * 공유 — 불러오면 주소창이 그대로 링크가 된다. 받은 사람이 열면 칸이 채워져 바로 불러온다.
 *   /editor?u=https://ichio.org/{1}/{2}.webp&c={1}=MAHORA/JYH1&c={2}=1..54
 * 사진이 아니라 「불러오는 방법」 을 담는 것이라 길이가 짧고, 파일로 연 사진은 담을 수 없다.
 * 「링크 복사」 는 주소창을 손으로 복사하는 것과 같다.
 * 「바로가기 저장」(위 막대)은 그 링크로 옮겨 주는 .html 파일을 내려받는다 — 불러올 때 onLoaded 로 링크를 넘긴다.
 */
const SHARE_URL = "u";
const SHARE_COL = "c";

/** 이 화면의 주소(경로 + 쿼리). 주소창에 쓰고, 앞에 origin 을 붙여 복사한다. */
function sharePath(template: string, cols: { name: string; text: string }[]): string {
    const q = new URLSearchParams();
    q.set(SHARE_URL, template);
    for (const c of cols) q.append(SHARE_COL, `${c.name}=${c.text}`);
    return `${location.pathname}?${q}`;
}

/** 링크에서 주소와 칸을 꺼낸다. 칸 이름에는 = 가 없다고 보고 첫 = 에서 나눈다. */
function readShared(): { template: string; cols: { name: string; text: string }[] } | null {
    const q = new URLSearchParams(location.search);
    const template = q.get(SHARE_URL);
    if (!template) return null;
    const cols = q.getAll(SHARE_COL).map((s) => {
        const at = s.indexOf("=");
        return at < 0 ? { name: s, text: "" } : { name: s.slice(0, at), text: s.slice(at + 1) };
    });
    return { template, cols };
}

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
`
const Cols = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 8px;
`
/* 칸 하나 — 위에 이름, 아래에 값. */
const Col = styled.div<{ $bad: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 200px;

    .head { display: flex; align-items: center; gap: 2px; }
    .name {
        flex: 1;
        min-width: 0;
        height: 24px;
        padding: 0 2px;
        border: none;
        border-bottom: 1px dashed transparent;
        background: transparent;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-2);
    }
    .name:hover { border-bottom-color: var(--line-dash); }
    .name:focus { outline: none; border-bottom-color: var(--accent); }
    .name::placeholder { color: var(--placeholder); font-weight: 400; }
    .val {
        height: 32px;
        padding: 0 10px;
        border: 1px solid ${({ $bad }) => ($bad ? "var(--warn)" : "var(--line-strong)")};
        border-radius: 6px;
        background: var(--bg);
        font-family: ui-monospace, Consolas, monospace;
        font-size: 13px;
        color: var(--text);
    }
    .val:focus { outline: none; border-color: var(--accent); }
    .icon {
        width: 22px;
        height: 22px;
        padding: 0;
        border: none;
        border-radius: 4px;
        background: none;
        color: var(--placeholder);
        font-size: 13px;
        cursor: pointer;
    }
    .icon:hover { background: var(--bg-soft); color: var(--accent); }
    .icon.del:hover { color: var(--danger); }
`
const AddCol = styled.button`
    height: 32px;
    padding: 0 12px;
    border: 1px dashed var(--line-dash);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text-2);
    font-size: 13px;
    cursor: pointer;
    &:hover { border-color: var(--accent); color: var(--accent); }
`
const Label = styled.label`
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);

    span { font-weight: 400; color: var(--muted); }
    input {
        height: 32px;
        padding: 0 10px;
        border: 1px solid var(--line-strong);
        border-radius: 6px;
        background: var(--bg);
        font-size: 13px;
        font-weight: 400;
        color: var(--text);
    }
    input:focus { outline: none; border-color: var(--accent); }
`
const Foot = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`
const Hint = styled.span<{ $warn?: boolean }>`
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: ${({ $warn }) => ($warn ? "var(--warn-text)" : "var(--muted)")};
    word-break: break-all;
`
const ShareButton = styled.button`
    flex-shrink: 0;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--line-strong);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text-2);
    font-size: 13px;
    cursor: pointer;
    &:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    &:disabled { opacity: .45; cursor: default; }
`
const LoadButton = styled.button`
    flex-shrink: 0;
    height: 32px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 13px;
    cursor: pointer;
    &:hover:not(:disabled) { background: var(--accent-strong); }
    &:disabled { opacity: .45; cursor: default; }
`

type Column = { id: number; name: string; text: string };
let nextId = 1;

/** 아직 안 쓴 가장 작은 {n}. */
const freshName = (cols: Column[]) => {
    let n = 1;
    while (cols.some((c) => c.name === `{${n}}`)) n++;
    return `{${n}}`;
};

/** %EC%83%81 같은 인코딩을 풀어 둔다. 안 풀면 주소에 적은 「상황」 을 못 찾는다. */
const decode = (u: string) => { try { return decodeURI(u); } catch { return u; } };

export default function UrlBar({ onLoaded }: { onLoaded?: (link: string, title: string) => void }) {
    const { addImages, removeImages } = useImages();

    const [cols, setCols] = useState<Column[]>([{ id: nextId++, name: "{1}", text: "" }]);
    const [template, setTemplate] = useState("");
    const [status, setStatus] = useState("");
    const [autoLoad, setAutoLoad] = useState(false);
    const urlInput = useMemo(() => ({ el: null as HTMLInputElement | null }), []);

    const url = decode(template.trim());
    const isUrl = /^https?:\/\/[^/]+\//i.test(url);

    const patch = (id: number, change: Partial<Column>) => {
        setStatus("");
        setCols((cs) => cs.map((c) => (c.id === id ? { ...c, ...change } : c)));
    };
    const addCol = () => { setStatus(""); setCols((cs) => [...cs, { id: nextId++, name: freshName(cs), text: "" }]); };
    const removeCol = (id: number) => { setStatus(""); setCols((cs) => cs.filter((c) => c.id !== id)); };

    /** 칸 이름을 주소 칸의 커서 자리(없으면 끝)에 끼워 넣는다. */
    const insertName = (name: string) => {
        if (!name) return;
        const el = urlInput.el;
        const at = el?.selectionStart ?? template.length;
        const end = el?.selectionEnd ?? at;
        setTemplate(template.slice(0, at) + name + template.slice(end));
        setStatus("");
        requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(at + name.length, at + name.length); });
    };

    // 칸마다 검사. 값이 비었고 주소에도 안 쓴 칸은 없는 셈 친다(+ 만 눌러 둔 칸).
    const used = cols.filter((c) => c.text || (c.name && url.includes(c.name)));
    const checked = used.map((c) => {
        const parsed = parseValues(c.text);
        const problem =
            !c.name ? "칸 이름을 넣으세요"
            : !c.text ? `「${c.name}」 의 값을 넣으세요`
            : isUrl && !url.includes(c.name) ? `「${c.name}」 가 주소에 없습니다 — 바꿀 자리에 그대로 적으세요`
            : !parsed.ok ? `「${c.name}」 · ${parsed.reason}`
            : "";
        return { col: c, parsed, problem };
    });
    const problem = checked.find((c) => c.problem)?.problem ?? "";
    const colKey = JSON.stringify(used.map((c) => [c.name, c.text]));

    // 반복 순서는 칸 순서가 아니라 주소에서의 위치 — 왼쪽이 바깥.
    const conds: Cond[] = useMemo(() => (problem || !isUrl ? [] : checked
        .map(({ col, parsed }) => ({ key: col.name, values: parsed.ok ? parsed.values : [] }))
        .sort((a, b) => url.indexOf(a.key) - url.indexOf(b.key))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [problem, isUrl, url, colKey]);
    const total = problem ? 0 : countConds(conds);

    const groups = useMemo(
        () => (isUrl && !problem && total <= MAX_COUNT ? buildTemplateGroups(url, conds) : []),
        [isUrl, problem, total, url, conds],
    );

    const groupNames = useMemo(() => templateGroupNames(conds), [conds]);

    const linkPath = () => sharePath(template.trim(), used.map(({ name, text }) => ({ name, text })));

    // 바로 넣고 패널을 닫는다. 안 열리는 번호는 뒤에서 빠진다(UrlSequence 의 「먼저 넣고, 뒤에서 뺀다」).
    const load = () => {
        if (groups.length === 0) return;
        const perGroup = itemsFromGroups(groups, groupNames);
        const added = perGroup.reduce((n, g) => n + g.length, 0);
        addImages(perGroup.flat());
        history.replaceState(history.state, "", linkPath());   // 주소창 = 공유 링크
        setStatus(`${added}장 넣음 · 안 열리는 번호를 빼는 중…`);
        let host = "";
        try { host = new URL(url).hostname; } catch { /* groups 가 있으면 주소는 맞다 */ }
        onLoaded?.(location.origin + linkPath(), groupNames[0] || host);   // 메뉴 패널을 닫고, 바로가기 링크를 넘긴다
        pruneMissing(perGroup, removeImages).then(({ kept, dropped }) => setStatus(
            kept === 0 ? "열리는 이미지가 없습니다. 주소와 값을 확인하세요."
            : `${kept}장${dropped ? ` (안 열리는 번호 ${dropped}개 뺌)` : ""}`
        ));
    };
    const handleLoad = (e: React.FormEvent) => { e.preventDefault(); load(); };

    // 공유 링크로 열었으면 칸을 채우고, 칸이 계산된 다음 렌더에서 불러온다.
    useEffect(() => {
        const shared = readShared();
        if (!shared) return;
        setTemplate(shared.template);
        setCols(shared.cols.length ? shared.cols.map((c) => ({ id: nextId++, ...c })) : [{ id: nextId++, name: "{1}", text: "" }]);
        setAutoLoad(true);
    }, []);
    useEffect(() => {
        if (!autoLoad) return;
        setAutoLoad(false);
        if (groups.length > 0) load();
        else setStatus(problem || "링크의 주소를 읽지 못했습니다.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad]);

    const copyLink = async () => {
        const link = location.origin + linkPath();
        try {
            await navigator.clipboard.writeText(link);
            setStatus("링크를 복사했습니다 — 받은 사람이 열면 같은 이미지를 불러옵니다.");
        } catch {
            setStatus(`복사하지 못했습니다. 직접 복사하세요: ${link}`);
        }
    };

    const sample = groups[0]?.[0];
    const names = used.map((c) => c.name).filter(Boolean);
    const warn = !status && Boolean(problem || total > MAX_COUNT || (template && !isUrl));
    const hint =
        status
        || (template && !isUrl && "http 로 시작하는 이미지 주소를 넣으세요.")
        || problem
        || (total > MAX_COUNT && `${total}장 — 한 번에 ${MAX_COUNT}장까지입니다.`)
        || (!template && "바뀌는 부분마다 칸을 만들고, 주소의 그 자리에 칸 이름을 적으세요.")
        || (groups.length > 1 && `${total}장 · ${groups.length}묶음 · 묶음마다 연속 ${STOP_AFTER}장이 없으면 다음으로`)
        || (groups.length === 1 && `${total}장`)
        || "";

    return (
        <Form onSubmit={handleLoad}>
            <Cols>
                {cols.map((c) => {
                    const row = checked.find((k) => k.col.id === c.id);
                    return (
                        <Col key={c.id} $bad={Boolean(c.text) && Boolean(row && !row.parsed.ok)}>
                            <div className="head">
                                <input className="name" placeholder="{1}" value={c.name}
                                    aria-label="칸 이름" onChange={(e) => patch(c.id, { name: e.target.value })} />
                                <button type="button" className="icon" title="이 이름을 주소에 넣기" aria-label="이 이름을 주소에 넣기"
                                    onClick={() => insertName(c.name)}>↓</button>
                                <button type="button" className="icon del" title="칸 지우기" aria-label="칸 지우기"
                                    onClick={() => removeCol(c.id)}>×</button>
                            </div>
                            <input className="val" placeholder="1..54 · a..z · red, blue" value={c.text}
                                aria-label={`${c.name || "칸"} 값`} title="하나: MAHORA/JYH1 · 숫자 범위: 1..54 · 001..100 · 알파벳 범위: a..z · aa..zz · 단어 여러 개: happy, sad, angry"
                                onChange={(e) => patch(c.id, { text: e.target.value })} />
                        </Col>
                    );
                })}
                <AddCol type="button" onClick={addCol}>+ 바꿀 부분</AddCol>
            </Cols>

            <Label>
                <div>주소 <span>{names.length ? `— 바꿀 자리에 ${names.map((n) => `「${n}」`).join(" ")} 를 그대로` : "— 바꿀 자리에 칸 이름을 그대로"}</span></div>
                <input
                    ref={(el) => { urlInput.el = el; }}
                    type="text"
                    placeholder="https://example.com/comic/{1}/{2}.webp"
                    value={template}
                    onChange={(e) => { setTemplate(e.target.value); setStatus(""); }}
                />
            </Label>

            <Foot>
                <Hint $warn={warn}>
                    {hint}
                    {!status && !problem && sample && conds.length > 0 && <> · 예: {sample}</>}
                </Hint>
                <ShareButton type="button" disabled={groups.length === 0} onClick={copyLink}
                    title="지금 주소와 칸을 담은 링크를 복사합니다">링크 복사</ShareButton>
                <LoadButton type="submit" disabled={groups.length === 0}>
                    불러오기
                </LoadButton>
            </Foot>
        </Form>
    );
}

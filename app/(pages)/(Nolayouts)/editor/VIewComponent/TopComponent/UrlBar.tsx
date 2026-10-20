"use client"

import { useImages } from "@/app/(Context)/ImageProvider";
import { buildGroups, countOf, defaultPick, isSlot, loadGroups, MAX_COUNT, parseValues, Piece, splitUrl, STOP_AFTER, Value } from "@/app/(Tools)/UrlSequence";
import { useMemo, useState } from "react";
import styled from "styled-components";

/* ── 주소로 불러오기 ─────────────────────────────────────────
 *
 *   [ https://…/ep3/001.webp                        ] [불러오기]
 *   …/ep [3] / [001] .webp     ep [ 3..7 ]   / [ 1..100 ]   5묶음 × 최대 100장
 *
 * 진짜 주소를 그대로 붙여넣고, 바꿀 숫자(나 알파벳 덩어리)를 누르면 값 칸이 생긴다.
 * 주소창을 여러 개로 나누지 않은 건 — 사용자가 주소를 직접 쪼개야 해서다.
 * 템플릿 문법을 따로 배울 필요가 없게 했다. 값 칸 문법은 parseValues 참고.
 */

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
`
const Line = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
`
const UrlField = styled.input`
    flex: 1;
    min-width: 0;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #d5dae1;
    border-radius: 6px;
    background: #fff;
    font-size: 13px;
    color: #1f2937;

    &:focus { outline: none; border-color: #4f46e5; }
`
const LoadButton = styled.button`
    flex-shrink: 0;
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 6px;
    background: #4f46e5;
    color: #fff;
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) { background: #4338ca; }
    &:disabled { opacity: .45; cursor: default; }
`
/* 둘째 줄: 조각난 주소 + 값 칸들 + 안내. 좁으면 접혀 내려간다. */
const Vars = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    font-size: 12px;
    color: #8a919c;
`
/* 주소를 조각내 보여준다. 숫자·알파벳 덩어리를 누를 수 있다. */
const Pieces = styled.div`
    max-width: 100%;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 12px;
    line-height: 1.9;
    word-break: break-all;
`
/* 알파벳 칸은 점선으로 흐리게 — 보통 바꾸는 건 숫자라 숫자가 먼저 눈에 띄어야 한다. */
const NumChip = styled.button<{ $on: boolean; $word: boolean }>`
    padding: 1px 4px;
    margin: 0 1px;
    border: 1px ${({ $word, $on }) => ($word && !$on ? "dashed" : "solid")} ${({ $on }) => ($on ? "#4f46e5" : "#c3c9d2")};
    border-radius: 4px;
    background: ${({ $on }) => ($on ? "#4f46e5" : "#fff")};
    color: ${({ $on, $word }) => ($on ? "#fff" : $word ? "#6b7280" : "#1f2937")};
    font: inherit;
    cursor: pointer;
`
const VarField = styled.label<{ $bad: boolean }>`
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 11px;

    input {
        width: 110px;
        height: 26px;
        padding: 0 8px;
        border: 1px solid ${({ $bad }) => ($bad ? "#d97706" : "#d5dae1")};
        border-radius: 5px;
        background: #fff;
        font: inherit;
        font-size: 12px;
        color: #1f2937;
    }
    input:focus { outline: none; border-color: #4f46e5; }
`
const Hint = styled.span<{ $warn?: boolean }>`
    color: ${({ $warn }) => ($warn ? "#b45309" : "#8a919c")};
`

/** 칸에 처음 넣어둘 값 — 주소에 적힌 그대로 (숫자는 앞의 0 을 뗀다). */
const initialOf = (p: Piece) => (p.kind === "num" ? String(Number(p.text)) : p.text);

/** 숫자 바로 앞 몇 글자 — 「ep」 처럼 이 숫자가 어디인지 알려준다. */
const labelBefore = (pieces: Piece[], i: number) => {
    const before = pieces.slice(1, i).map((p) => p.text).join("");
    return before.split(/[/?&=#]/).at(-1)?.slice(-8) || "#";
}

export default function UrlBar() {
    const { addImages } = useImages();

    const [url, setUrl] = useState("");
    /** 숫자 위치 → 값 칸에 적힌 글자 */
    const [texts, setTexts] = useState<Record<number, string>>({});
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");

    const pieces = useMemo(() => splitUrl(url), [url]);

    // 주소를 바꾸면 마지막 숫자 하나만 켜고, 값은 주소에 적힌 번호로 둔다.
    const handleUrl = (value: string) => {
        setUrl(value);
        setStatus("");
        const next = splitUrl(value);
        const pick = next ? defaultPick(next) : -1;
        setTexts(pick >= 0 ? { [pick]: initialOf(next![pick]) } : {});
    }

    const toggle = (i: number) => {
        setStatus("");
        setTexts((prev) => {
            const { [i]: had, ...rest } = prev;
            return had !== undefined ? rest : { ...rest, [i]: initialOf(pieces![i]) };
        });
    }

    const order = Object.keys(texts).map(Number).sort((a, b) => a - b);
    const parsed = useMemo(
        () => new Map(Object.entries(texts).map(([k, t]) => [Number(k), parseValues(t)])),
        [texts],
    );

    const problem = [...parsed.values()].find((p) => !p.ok);
    const vars = useMemo(() => {
        const out = new Map<number, Value[]>();
        for (const [k, p] of parsed) if (p.ok) out.set(k, p.values);
        return out;
    }, [parsed]);

    const total = problem ? 0 : countOf(vars);
    const groups = useMemo(
        () => (pieces && !problem && vars.size ? buildGroups(pieces, vars) : []),
        [pieces, problem, vars],
    );

    const handleLoad = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy || groups.length === 0) return;

        setBusy(true);
        const { items, checked } = await loadGroups(groups, (n, c) => setStatus(`확인 중 · ${c}개 중 ${n}장 찾음`));
        addImages(items);
        setStatus(
            items.length === 0 ? "열리는 이미지가 없습니다. 주소와 번호를 확인하세요."
            : `${items.length}장 추가 (${checked}개 확인${checked < total ? ` · 빈 번호가 이어져 ${total - checked}개 건너뜀` : ""})`
        );
        setBusy(false);
    }

    const warn = !status && (Boolean(problem) || total > MAX_COUNT || (Boolean(url) && !pieces));
    const hint =
        status
        || (url && !pieces && "http 로 시작하는 이미지 주소를 넣으세요.")
        || (pieces && order.length === 0 && "바꿀 칸을 누르세요.")
        || (problem && !problem.ok && problem.reason)
        || (total > MAX_COUNT && `${total}장 — 한 번에 ${MAX_COUNT}장까지입니다.`)
        || (groups.length > 1 && `${groups.length}묶음 × 최대 ${groups[0].length}장 · 묶음마다 연속 ${STOP_AFTER}장이 없으면 다음으로`)
        || (groups.length === 1 && `${groups[0].length}장 · 범위는 1..239 · a..f, 골라서는 1,3,7`)
        || "";

    return (
        <Form onSubmit={handleLoad}>
            <Line>
                <UrlField
                    type="url"
                    placeholder="이미지 주소를 붙여넣으세요 — 예: https://…/ep3/001.webp"
                    value={url}
                    onChange={(e) => handleUrl(e.target.value)}
                />
                <LoadButton type="submit" disabled={busy || groups.length === 0}>
                    {busy ? "불러오는 중…" : "불러오기"}
                </LoadButton>
            </Line>

            {url && (
                <Vars>
                    {pieces && (
                        <Pieces>
                            {pieces.map((p, i) =>
                                !isSlot(p)
                                    // 도메인은 길기만 하고 바꿀 일이 없다.
                                    ? <span key={i}>{i === 0 ? "…" : p.text}</span>
                                    : <NumChip key={i} type="button" $on={i in texts} $word={p.kind === "word"} onClick={() => toggle(i)}
                                          title={i in texts ? "값 칸 끄기" : "여기도 바꾸기"}>{p.text}</NumChip>
                            )}
                        </Pieces>
                    )}

                    {pieces && order.map((i) => (
                        <VarField key={i} $bad={!parsed.get(i)?.ok} title="1..239 · a..f · 1,3,7 · X,Y">
                            {labelBefore(pieces, i)}
                            <input
                                value={texts[i]}
                                placeholder="1..239"
                                onChange={(e) => { setStatus(""); setTexts((prev) => ({ ...prev, [i]: e.target.value })); }}
                            />
                        </VarField>
                    ))}

                    {hint && <Hint $warn={warn}>{hint}</Hint>}
                </Vars>
            )}
        </Form>
    )
}

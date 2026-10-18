"use client"

import { useImages } from "@/app/(Context)/ImageProvider";
import { UserImageManager } from "@/app/(Tools)/UserImageManager";
import { buildGroups, countOf, defaultPick, loadGroups, MAX_COUNT, Piece, Span, splitUrl, STOP_AFTER } from "@/app/(Tools)/UrlSequence";
import { useMemo, useState } from "react";
import styled from "styled-components"

const Wrapper=styled.div`
    flex-shrink: 0;
    padding: 10px;
    border-bottom: 1px solid #e6e9ee;
    display: flex;
    flex-direction: column;
    gap: 8px;
`
const HiddenFileInput = styled.input.attrs({ type: "file" 
, accept: 'image/*'  ,
multiple:true

})`
  display: none;
`;

// 사용자가 보게 될 업로드 버튼
const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 16px;
  border-radius: 6px;
  background-color: #4f46e5;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  gap: 8px;
  border: none;

  &:hover {
    background-color: #4338ca;
  }
`;

/* ── 주소로 불러오기 ── */
const UrlForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 6px;
`
const Field = styled.input`
    width: 100%;
    min-width: 0;
    padding: 7px 8px;
    border: 1px solid #d5dae1;
    border-radius: 6px;
    background: #fff;
    font-size: 12px;
    color: #1f2937;

    &:focus {
        outline: none;
        border-color: #4f46e5;
    }
`
/* 주소를 조각내 보여준다. 숫자만 누를 수 있다. */
const Pieces = styled.div`
    padding: 6px 8px;
    border-radius: 6px;
    background: #f0f2f5;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 11px;
    line-height: 1.9;
    color: #8a919c;
    word-break: break-all;
`
const NumChip = styled.button<{ $on: boolean }>`
    padding: 1px 4px;
    margin: 0 1px;
    border: 1px solid ${({ $on }) => ($on ? "#4f46e5" : "#c3c9d2")};
    border-radius: 4px;
    background: ${({ $on }) => ($on ? "#4f46e5" : "#fff")};
    color: ${({ $on }) => ($on ? "#fff" : "#1f2937")};
    font: inherit;
    cursor: pointer;
`
const Range = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8a919c;
`
const RangeLabel = styled.span`
    flex-shrink: 0;
    width: 64px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl;         /* 넘치면 앞을 자른다 — 숫자 바로 앞 글자가 중요하다 */
    text-align: left;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 11px;
`
const LoadButton = styled.button`
    padding: 8px 12px;
    border: 1px solid #4f46e5;
    border-radius: 6px;
    background: #fff;
    color: #4f46e5;
    font-size: 12px;
    cursor: pointer;

    &:hover:not(:disabled) { background: #eef2ff; }
    &:disabled { opacity: .5; cursor: default; }
`
const Hint = styled.p`
    margin: 0;
    font-size: 11px;
    line-height: 1.5;
    color: #8a919c;
    word-break: break-all;
`

/** 입력 중인 범위. 칸을 비울 수 있어야 해서 글자로 든다. */
type SpanInput = { from: string; to: string };

/** 숫자 바로 앞 몇 글자 — 「ep3/」 처럼 이 숫자가 어디인지 알려준다. */
const labelBefore = (pieces: Piece[], i: number) =>
    pieces.slice(1, i).map((p) => p.text).join("").slice(-10) || "#";

export default function LeftTop(){
    const {addImages}=useImages();

    const { inputimages } =UserImageManager(); //이거 manager=UserImageManger() 받고
    //manager.inputimages () 이거랑같은뜻임

    const Inputhandler=async (e:React.ChangeEvent<HTMLInputElement>)=>{
            const filelist = e.target.files; 
               if (!filelist) return;
            const files=Array.from(filelist);
            const inputimage =await inputimages(files);//만들어둔유틸함수로 편하게 필요정보만

            addImages(inputimage)
            e.target.value='';//리셋
    }

    /* 주소로 불러오기 — 주소 안의 숫자를 골라 숫자마다 from~to 로 바꿔가며 연다. */
    const [url, setUrl] = useState("");
    const [spans, setSpans] = useState<Record<number, SpanInput>>({});
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");

    const pieces = useMemo(() => splitUrl(url), [url]);

    // 주소를 바꾸면 마지막 숫자 하나만 켜고, 시작은 주소에 적힌 번호로 둔다.
    const handleUrl = (value: string) => {
        setUrl(value);
        setStatus("");
        const next = splitUrl(value);
        const pick = next ? defaultPick(next) : -1;
        setSpans(pick >= 0 ? { [pick]: { from: String(Number(next![pick].text)), to: "" } } : {});
    }

    const toggle = (i: number) => {
        setStatus("");
        setSpans((prev) => {
            const { [i]: had, ...rest } = prev;
            return had ? rest : { ...rest, [i]: { from: String(Number(pieces![i].text)), to: "" } };
        });
    }

    const setSpan = (i: number, key: keyof SpanInput, value: string) =>
        setSpans((prev) => ({ ...prev, [i]: { ...prev[i], [key]: value } }));

    // 끝을 비워두면 시작 한 칸만. 칸이 하나라도 이상하면 null.
    const parsed = useMemo(() => {
        const out = new Map<number, Span>();
        for (const [k, v] of Object.entries(spans)) {
            const from = Number(v.from);
            const to = v.to === "" ? from : Number(v.to);
            if (v.from === "" || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0) return null;
            out.set(Number(k), { from, to });
        }
        return out.size ? out : null;
    }, [spans]);

    const total = parsed ? countOf(parsed) : 0;
    const groups = useMemo(() => (pieces && parsed ? buildGroups(pieces, parsed) : []), [pieces, parsed]);

    const handleLoad = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy || groups.length === 0) return;

        setBusy(true);
        const { items, checked } = await loadGroups(groups, (n, c) => setStatus(`확인 중 · ${c}개 중 ${n}장 찾음`));
        addImages(items);
        setStatus(
            items.length === 0 ? "열리는 이미지가 없습니다. 주소와 번호를 확인하세요."
            : `${items.length}장 추가했습니다 (${checked}개 확인${checked < total ? ` · 빈 번호가 이어져 ${total - checked}개는 건너뜀` : ""}).`
        );
        setBusy(false);
    }

    const order = Object.keys(spans).map(Number).sort((a, b) => a - b);

    const hint =
        status
        || (url && !pieces && "주소에 바꿀 숫자가 없습니다. http 로 시작하는 이미지 주소를 넣으세요.")
        || (pieces && order.length === 0 && "바꿀 숫자를 눌러 고르세요.")
        || (total > MAX_COUNT && `${total}장 — 한 번에 ${MAX_COUNT}장까지입니다.`)
        || (groups.length > 1 && `${groups.length}묶음 × 최대 ${groups[0].length}장 · 묶음마다 연속 ${STOP_AFTER}장이 없으면 다음으로`)
        || (groups.length === 1 && `${groups[0].length}장`)
        || "주소 안의 숫자를 범위만큼 바꿔 한 번에 불러옵니다.";

    return (
        <Wrapper>
           <UploadButton htmlFor="inputbutton" >인풋</UploadButton>
           <HiddenFileInput id="inputbutton" onChange={Inputhandler}/>

           <UrlForm onSubmit={handleLoad}>
               <Field
                   type="url"
                   placeholder="이미지 주소 (예: …/ep3/001.webp)"
                   value={url}
                   onChange={(e) => handleUrl(e.target.value)}
               />

               {pieces && (
                   <Pieces>
                       {pieces.map((p, i) =>
                           p.kind === "text"
                               // 도메인은 길기만 하고 바꿀 일이 없다.
                               ? <span key={i}>{i === 0 ? "…" : p.text}</span>
                               : <NumChip key={i} type="button" $on={i in spans} onClick={() => toggle(i)}
                                     title={i in spans ? "범위 끄기" : "이 숫자도 바꾸기"}>{p.text}</NumChip>
                       )}
                   </Pieces>
               )}

               {pieces && order.map((i) => (
                   <Range key={i}>
                       <RangeLabel title={labelBefore(pieces, i)}>{labelBefore(pieces, i)}</RangeLabel>
                       <Field type="number" min={0} inputMode="numeric" aria-label="시작 번호"
                           value={spans[i].from} onChange={(e) => setSpan(i, "from", e.target.value)} />
                       ~
                       <Field type="number" min={0} inputMode="numeric" aria-label="끝 번호" placeholder="끝"
                           value={spans[i].to} onChange={(e) => setSpan(i, "to", e.target.value)} />
                   </Range>
               ))}

               {pieces && (
                   <LoadButton type="submit" disabled={busy || groups.length === 0}>
                       {busy ? "불러오는 중…" : "불러오기"}
                   </LoadButton>
               )}
               <Hint>{hint}</Hint>
           </UrlForm>
        </Wrapper>
    )
}

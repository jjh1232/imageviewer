"use client"
import styled from "styled-components"
import { useImages } from "@/app/(Context)/ImageProvider"
import { UserImageManager } from "@/app/(Tools)/UserImageManager"
import UrlBar from "./TopComponent/UrlBar"
import ThemeToggle from "@/app/(Component)/ThemeToggle"
import { useLang } from "@/i18n/EditorLang"
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config"
import { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTableColumns, faLink } from "@fortawesome/free-solid-svg-icons"
import { downloadShortcut } from "@/app/(Tools)/Shortcut"

/* 위: 불러오기(파일 · 주소)와 보기 모드. 확대는 아래 넘기기 사이로 옮겼다.
   **한 줄로 고정한다.** 주소 불러오기는 조건 줄이 늘어나면 막대가 두세 줄로 불어나 보기 영역을
   갉아먹어서, 버튼을 누르면 아래로 펼쳐지는 패널로 뺐다(UrlMenu). */
const Wrapper=styled.div`
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
    background-color: var(--bg);
    z-index: 60;            /* 펼친 패널이 왼쪽 목록(z 10)·리사이저(z 20) 위로 와야 한다 */
`
const HiddenFileInput = styled.input.attrs({ type: "file", accept: "image/*", multiple: true })`
    display: none;
`
/* 뒤로가기(useJumpHistory). 건너뛴 기록이 없으면 흐리게. 브라우저 뒤로가기 · Esc 와 같다. */
const BackButton = styled.button`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    &:hover:not(:disabled) { background: var(--bg-soft); }
    &:disabled { opacity: .35; cursor: default; }
`
/* 왼쪽 파일 목록 여닫기 — 목록 바로 위라 맨 왼쪽. 보기 모드의 「목록」(grid) 과 헷갈리지 않게 글자 없이 아이콘만. */
const SideButton = styled.button`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text-2);
    font-size: 14px;
    cursor: pointer;
    &:hover { background: var(--bg-soft); }
    &[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
`
const FileButton = styled.label`
    flex-shrink: 0;
    height: 32px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
    cursor: pointer;

    &:hover { background: var(--bg-soft); }
`
/* 주소로 불러오기 버튼과 그 아래 펼쳐지는 패널. */
const UrlButton = styled.button<{ $open: boolean }>`
    flex-shrink: 0;
    height: 32px;
    padding: 0 14px;
    border: 1px solid ${({ $open }) => ($open ? "var(--accent)" : "var(--line-strong)")};
    border-radius: 10px;
    background: ${({ $open }) => ($open ? "var(--accent-soft)" : "var(--bg)")};
    color: ${({ $open }) => ($open ? "var(--accent)" : "var(--text)")};
    font-size: 13px;
    cursor: pointer;
    &:hover { background: ${({ $open }) => ($open ? "var(--accent-soft)" : "var(--bg-soft)")}; }
`
/* 화면 전체를 가리는 창이 아니라 버튼 아래 패널 — 뒤의 사진이 보인 채로 조건을 고친다. */
const Panel = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 12px;
    width: min(720px, calc(100vw - 24px));
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--bg);
    box-shadow: 0 12px 32px var(--shadow);
    z-index: 50;
`
const PanelTitle = styled.div`
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
`
/* 바로가기 저장(Shortcut.ts). 주소로 불러온 적이 있어야 켜진다 — 파일로 연 사진은 링크로 남길 수 없다. */
const ShortcutButton = styled.button`
    flex-shrink: 0;
    height: 32px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
    cursor: pointer;
    &:hover:not(:disabled) { background: var(--bg-soft); }
    &:disabled { opacity: .45; cursor: default; }
`
/*
 * 비우기. 실수로 다 날리지 않게 두 번 누르게 한다 — 첫 번째에 「한 번 더」 로 바뀌고 3초 지나면 돌아온다.
 * 창을 띄우는 confirm 보다 손이 덜 가고, 주소로 다시 부르려면 바로가기가 있다.
 */
const ClearButton = styled.button<{ $armed: boolean }>`
    flex-shrink: 0;
    height: 32px;
    padding: 0 12px;
    border: 1px solid ${({ $armed }) => ($armed ? "var(--danger)" : "var(--line-strong)")};
    border-radius: 10px;
    background: var(--bg);
    color: ${({ $armed }) => ($armed ? "var(--danger)" : "var(--text)")};
    font-size: 13px;
    cursor: pointer;
    &:hover:not(:disabled) { border-color: var(--danger); color: var(--danger); }
    &:disabled { opacity: .45; cursor: default; }
`
const Spacer = styled.div`flex: 1;`
/* 밝게 ↔ 어둡게. 보기 모드 오른쪽 끝. */
const ThemeButton = styled(ThemeToggle)`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
    &:hover { background: var(--bg-soft); }
`
/* 세 칸짜리 토글. 지금 모드가 눌려 있다. */
const Modes=styled.div`
    flex-shrink: 0;
    display: flex;
    height: 32px;
    padding: 2px;
    border-radius: 10px;
    background: var(--bg-sunk);
`
const Mode=styled.button<{ $on: boolean }>`
    padding: 0 12px;
    border: none;
    border-radius: 8px;
    background: ${({ $on }) => ($on ? "var(--bg)" : "transparent")};
    box-shadow: ${({ $on }) => ($on ? "0 1px 2px rgba(0,0,0,.12)" : "none")};
    color: ${({ $on }) => ($on ? "var(--text)" : "var(--muted)")};
    font-size: 13px;
    cursor: pointer;
`

type ViewModes = "single"|"double"|"webtoon"|"grid" //유니온타입은string안되네

const modes:ViewModes[]=["single","double","webtoon","grid"]

/* 언어 고르기(EditorLang). 테마 버튼 옆. */
const LangSelect = styled.select`
    flex-shrink: 0;
    height: 32px;
    padding: 0 6px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
    cursor: pointer;
    &:hover { background: var(--bg-soft); }
`

export default function ViewTop({
    viewmode,setViewmode,onBack,canBack,sideOpen,onToggleSide,onCleared}:
    {viewmode:string,setViewmode:React.Dispatch<React.SetStateAction<ViewModes>>,onBack:()=>void,canBack:boolean,
        sideOpen:boolean,onToggleSide:()=>void,onCleared:()=>void}
){
    const {addImages}=useImages();
    const {inputimages}=UserImageManager();
    const {t,lang,setLang}=useLang();
    const [shortcut,setShortcut]=useState<{link:string,title:string}|null>(null);   // 마지막으로 주소로 불러온 것
    const [urlReset,setUrlReset]=useState(0);   // 비우기마다 올린다 — 주소 패널을 새로 만들어 칸을 비운다

    const handleFiles=async (e:React.ChangeEvent<HTMLInputElement>)=>{
        if(!e.target.files) return;
        addImages(await inputimages(Array.from(e.target.files)));
        e.target.value='';//같은 파일을 다시 골라도 onChange 가 돌게
    }

    return (<Wrapper>
        <SideButton type="button" onClick={onToggleSide} aria-pressed={sideOpen}
            title={sideOpen ? t.hideFileList : t.showFileList} aria-label={t.fileList}>
            <FontAwesomeIcon icon={faTableColumns}/>
        </SideButton>
        <BackButton type="button" onClick={onBack} disabled={!canBack}
            title={`${t.back} (Esc)`} aria-label={t.back}>←</BackButton>
        <FileButton htmlFor="inputbutton">{t.openFiles}</FileButton>
        <HiddenFileInput id="inputbutton" onChange={handleFiles}/>

        <UrlMenu key={urlReset} onLoaded={(link,title)=>setShortcut({link,title})} />
        <ShortcutButton type="button" disabled={!shortcut}
            onClick={()=>shortcut && downloadShortcut(shortcut.link, shortcut.title, t)}
            title={shortcut ? t.saveShortcutTitle : t.saveShortcutOff}>
            <FontAwesomeIcon icon={faLink}/> {t.saveShortcut}
        </ShortcutButton>
        <ClearAll onCleared={()=>{ setUrlReset(n=>n+1); onCleared(); }} />
        <Spacer />

        <Modes>
            {modes.map((key)=>(
                <Mode key={key} type="button" $on={viewmode===key} onClick={()=>setViewmode(key)}>
                    {t.modes[key]}
                </Mode>
            ))}
        </Modes>
        <LangSelect value={lang} aria-label={t.language} title={t.language}
            onChange={(e)=>setLang(e.target.value as Locale)}>
            {LOCALES.map((l)=><option key={l} value={l}>{LOCALE_LABELS[l]}</option>)}
        </LangSelect>
        <ThemeButton labels={{ toLight: t.toLight, toDark: t.toDark }} />
    </Wrapper>)
}

/*
 * 주소로 불러오기 메뉴. 패널은 닫혀도 UrlBar 를 지우지 않고 숨기기만 한다 —
 * 다시 열면 마지막 주소·조건이 그대로 있어서 범위만 바꿔 또 불러올 수 있다.
 * 닫히는 때: 불러오기가 끝나 사진이 들어왔을 때 · Esc · 패널 바깥을 눌렀을 때.
 */
function UrlMenu({ onLoaded }: { onLoaded: (link: string, title: string) => void }) {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement>(null);
    const { t } = useLang();

    useEffect(() => {
        if (!open) return;
        // 열자마자 주소 칸에 커서
        box.current?.querySelector<HTMLInputElement>("input")?.focus();
        const onDown = (e: PointerEvent) => {
            if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div ref={box}>
            <UrlButton type="button" $open={open} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                {t.openUrl}
            </UrlButton>
            <Panel hidden={!open} role="dialog" aria-label={t.openUrl}>
                <PanelTitle>{t.openUrl}</PanelTitle>
                <UrlBar onLoaded={(link, title) => { setOpen(false); onLoaded(link, title); }} />
            </Panel>
        </div>
    );
}

/*
 * 비우면 주소창의 공유 링크도 지운다 — 남겨 두면 새로고침했을 때 방금 비운 것을 도로 불러온다.
 * 주소 패널의 칸도 비운다(ViewTop 이 UrlMenu 의 key 를 바꾼다). 링크를 먼저 지워야 새 패널이 그걸 도로 읽지 않는다.
 * 바로가기 버튼은 그대로 둔다(마지막으로 불러온 것을 아직 저장할 수 있게).
 */
function ClearAll({ onCleared }: { onCleared: () => void }) {
    const { images, clearImages } = useImages();
    const { t } = useLang();
    const [armed, setArmed] = useState(false);
    useEffect(() => {
        if (!armed) return;
        const t = setTimeout(() => setArmed(false), 3000);
        return () => clearTimeout(t);
    }, [armed]);

    const click = () => {
        if (!armed) { setArmed(true); return; }
        setArmed(false);
        clearImages();
        history.replaceState(history.state, "", location.pathname);
        onCleared();
    };

    return (
        <ClearButton type="button" $armed={armed} disabled={images.length === 0} onClick={click}
            title={t.clearTitle}>
            {armed ? t.clearConfirm(images.length) : t.clear}
        </ClearButton>
    );
}

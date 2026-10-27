"use client"
import styled from "styled-components"
import Leftsidebar from "./Leftsidebar"
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { UserImageManager } from "@/app/(Tools)/UserImageManager"
import MainViewer from "./MainViewCom/MainViewer"

const Wrapper=styled.div`
    //border: 2px solid blue;
    display: flex;
    flex:1;
    min-height: 0;              /* 위 막대 높이가 주소 줄에 따라 바뀐다. 남는 만큼만 차지한다 */
    //height: 100vh;
`
const SidebarWrapper=styled.div<{ $flexbasis: string; $iscollap: boolean }>`
   display: flex;
    flex-grow: 0; //커지지않음
    flex-shrink: 0; //줄어들지안음
    flex-basis: ${({ $iscollap, $flexbasis }) => ($iscollap ? "0px" : $flexbasis)};
  min-width: ${({ $iscollap }) => ($iscollap ? "0px" : "150px")};
  max-width: ${({ $iscollap }) => ($iscollap ? "0px" : "50vw")};
 // overflow: hidden; // 접힐 때 내용 가리기
    
    height: 100%;
    z-index: 10;
    
    

`
const MainWrapper=styled.div`
    position:relative;
    flex: 1;
    min-width: 0;              /* 이게 없으면 큰 이미지가 사이드바를 밀어낸다 */
    height: 100%;
    background: var(--bg-soft);
`
/*
 * 목록 폭을 끄는 손잡이. 선은 목록의 border-right 가 그리고, 이건 그 위에 겹친 투명한 띠다 —
 * 자리를 차지하지 않으면서(좌우 음수 margin) 잡을 폭은 7px 남긴다. 올리면 강조색 선이 보인다.
 * 여닫는 버튼은 위 막대 맨 왼쪽으로 옮겼다(예전엔 여기 붙어 있어 뷰어의 < 버튼과 겹쳤다).
 */
const Resizer=styled.div<{$iscollap:boolean}>`
    display: ${({ $iscollap }) => ($iscollap ? "none" : "block")};
    position: relative;
    z-index: 11;
    flex-shrink: 0;
    width: 7px;
    margin: 0 -4px 0 -3px;
    height: 100%;
    cursor: col-resize;
    background: linear-gradient(to right, transparent 2px, var(--hl, transparent) 2px, var(--hl, transparent) 4px, transparent 4px);
    &:hover, &:active { --hl: var(--accent); }
`
export default function MainView({
    Currentnumber,setCurrentnumber,onJump,viewmode,scale,setScale,fit,onFitRatio,onPick,gridOpen,onOpenGroup,sideOpen}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,onJump:(i:number)=>void,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>,
        fit:boolean,onFitRatio:(r:number)=>void,onPick:(i:number)=>void,
        gridOpen:string|null,onOpenGroup:(g:string|null)=>void,sideOpen:boolean
    }
){

    const [sidebarflexbasis,setSidebarflexbasis]=useState("15%");
    const [isResizing,setIsResizing]=useState(false)
    const iscollap=!sideOpen
    const startX=useRef(0); //드래그시작x좌표
    const containerRef=useRef<HTMLDivElement>(null); //전체컨테이너참조

    //콜백쓸거니까..
    const Inputma=UserImageManager();

    //리사이저클릭시(드래그시작) 유즈콜백으로메모이제이션
    const handleMouseDown=useCallback((e:React.MouseEvent)=>{
        e.preventDefault() //기본드래그방지
        setIsResizing(true) //드래그상ㅌ
        startX.current=e.clientX//현재마우스X저장
    },[])
    //마우스이동
    const handleMousemove=useCallback((e:MouseEvent)=>{
        if(!isResizing) return //드래그아니면무시

        const deltax=e.clientX-startX.current //마우스이동량계산
        const currentWidty=parseFloat(sidebarflexbasis)//현재사이드바 너비
        //컨테이너전체너비구하기
        const containerWidth=containerRef.current?.offsetWidth || window.innerWidth;
        //퍼센트로변환해 새너비계산
        const newWidth=currentWidty+(deltax*100/containerWidth);
        //범위
        const clampwidth=Math.max(15,Math.min(50,newWidth));
        setSidebarflexbasis(`${clampwidth}%`)//상태업데이트->즉시리렌더링
        startX.current=e.clientX; //새시작점갱신

    
    },[isResizing,sidebarflexbasis]) //유즈콜백의[]는 외부값선언
//마우스 떌시 드래그종료
const handleMouseUp=useCallback(()=>{
    setIsResizing(false)//오프
},[])
        //이벤트리스너 등록해제
        useEffect(()=>{
            if(isResizing){
                //문서전체에 mousemove,mouseup걸기 
                document.addEventListener("mousemove",handleMousemove)
                document.addEventListener("mouseup",handleMouseUp)
            }
            //컴포넌트 언마운트 or드래그시종료시정리
            return ()=>{
                document.removeEventListener("mousemove",handleMousemove)
                document.removeEventListener("mouseup",handleMouseUp)
            }
        },[isResizing,handleMousemove,handleMouseUp]) 

    return (<Wrapper ref={containerRef}>
        <SidebarWrapper $iscollap={iscollap} $flexbasis={sidebarflexbasis}>
            {//오버플로우 있으면 스티키안된다함;
            }
            <div style={{width:"100%",height:"100%",overflow:"hidden",display:"flex"}}>
            <Leftsidebar Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} onJump={onJump}/>
            </div>
            
        </SidebarWrapper>
    {/*리사이저  */}
    <Resizer $iscollap={iscollap} onMouseDown={handleMouseDown}/>

        <MainWrapper >
            <MainViewer Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} viewmode={viewmode}
                        scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio} onPick={onPick}
                        gridOpen={gridOpen} onOpenGroup={onOpenGroup}
            />
        </MainWrapper>
    </Wrapper>)
}
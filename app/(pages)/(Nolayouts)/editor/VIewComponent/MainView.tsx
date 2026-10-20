"use client"
import styled from "styled-components"
import Leftsidebar from "./Leftsidebar"
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSquareCaretLeft as leftarrow } from "@fortawesome/free-solid-svg-icons"
import { faSquareCaretRight as rightarrow } from "@fortawesome/free-solid-svg-icons"
import Slicearrow from "@/app/(Component)/Slicearrow/page"
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
    margin-left: -24px;        /* 리사이저의 토글 버튼 자리만큼 당긴다 */
    height: 100%;
    background: #f3f4f6;
`
//리사이저 콘테이너? 
const ResizerContainer=styled.div`
    flex-shrink: 0;//크기고정
      display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    
    
`
const Resizer=styled.div<{$iscollap:boolean}>`
    width: 8px;                // 리사이저 바 두께
    height: 100%;
  background: linear-gradient(90deg, #ccc, #999);  // 그라데이션 배경
  cursor: col-resize;         // 마우스 커서: 좌우 리사이즈 모양
  flex-shrink: 0;             // 리사이저 자체는 안 줄어듦
  
  display: ${({ $iscollap }) => ($iscollap ? "none" : "flex")};;        // 내부 중앙정렬
  align-items: center;
  justify-content: center;
  
  &:hover { background: linear-gradient(90deg, #999, #666); }  // 호버 효과
  &:active { background: #555; }  // 클릭 중 효과




`
//==토글버튼
const ToggleButton=styled.div<{$iscollap:boolean}>`
    position: relative;
    z-index: 20;
    right: -5px;
    top: 0%;
    
    transform: translateY(-50%);
    width: 24px;
    height: 24px;

`
//스타일드 아이콘
const Styledicon=styled(FontAwesomeIcon)`
    height: 100px;
`
export default function MainView({
    Currentnumber,setCurrentnumber,viewmode,scale,setScale,fit,onFitRatio}:
    {Currentnumber:number,setCurrentnumber:React.Dispatch<React.SetStateAction<number>>,
        viewmode:string,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>,
        fit:boolean,onFitRatio:(r:number)=>void
    }
){

    const [sidebarflexbasis,setSidebarflexbasis]=useState("15%");
    const [isResizing,setIsResizing]=useState(false)
    const [iscollap,setiscollap]=useState(false)
    const startX=useRef(0); //드래그시작x좌표
    const containerRef=useRef<HTMLDivElement>(null); //전체컨테이너참조

    //콜백쓸거니까..
    const Inputma=UserImageManager();

    //토글핸들러
    const toggleside=useCallback(()=>{
        setiscollap(!iscollap)
        setSidebarflexbasis(iscollap?"15%":"0px")
    },[iscollap])
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
            <Leftsidebar Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber}/>
            </div>
            
        </SidebarWrapper>
    {/*리사이저  */}
    <ResizerContainer >

    
    <Resizer 
    $iscollap={iscollap}
    onMouseDown={handleMouseDown}/>
    <ToggleButton $iscollap={iscollap} onClick={toggleside}>
        {iscollap?<Slicearrow mode={true}/> :<Slicearrow mode={false}/>}
        </ToggleButton>
    </ResizerContainer>

        <MainWrapper >
            <MainViewer Currentnumber={Currentnumber} setCurrentnumber={setCurrentnumber} viewmode={viewmode}
                        scale={scale} setScale={setScale} fit={fit} onFitRatio={onFitRatio}
            />
        </MainWrapper>
    </Wrapper>)
}
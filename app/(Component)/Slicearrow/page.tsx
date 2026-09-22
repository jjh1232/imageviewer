"use client"   // styled-components 는 클라이언트에서만 돈다.
               // 없으면 빌드가 "createContext is not a function" 으로 죽는다.
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled, { keyframes,css } from "styled-components";
import { faArrowLeft as leftarrow } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight as rightarrow } from "@fortawesome/free-solid-svg-icons";

const Leftmove=keyframes`

    from{
        opacity: 0;
        transform: translateX(0);
    }

    to{
        opacity: 1;
        transform: translateX(-17px);
    }
`
const Rightmove=keyframes`

    from{
        opacity: 0;
        transform: translateX(0);
    }
    to{
        opacity: 1;
        transform: translateX(2px);

    }
    
`
const barmove=keyframes`
    from{
        transform: translateX(0);
    }
    to{
         transform: translateX(18px);
    }
`
const MainWrapper=styled.div<{$mode:boolean}>`
    position: relative;
     display: flex;
  align-items: center;    /* Y축 중앙 */
    width: 30px;
    height: 30px;
    background-color: gray;
    border-radius: 40%;
    
     cursor: pointer;

     &:hover{
        background-color: white;
        
     }
      /* 화살표애니메이션 추가!!! */
       &:hover .arrow {//클래스선택자
    color: red !important;
   
     animation: ${({ $mode }) => 
      $mode ? Rightmove : Leftmove
    } 0.2s ease-out forwards;
} 
     /* BarWrapper 애니메이션 추가!!! */
  &:hover .bar {
    animation: ${({ $mode }) => 
      $mode && barmove
    } 0.2s ease-out forwards;
  }
  
`
const BarWrapper=styled.div<{$mode:boolean}>`
     margin-left: 4px;
      width: 3px;
  height: 20px;
  background: #333;
  //left: 5px;
   display: flex;
  align-items: center;    /* Y축 중앙 */
 
  
`
const Arrow=styled(FontAwesomeIcon)<{$mode:'left'|'right'}>`
    opacity: 0;
    position: relative;
    left: ${({$mode})=>
            $mode==="left"? "-20px":"23px"
    };
     
    
  /*메인랩퍼 호버시 등장  안먹힘..*/
  ${MainWrapper}:hover&svg {
    
    opacity: 1;
    color: red;
  }

`



export default function Slicearrow({mode=true}:{mode?:boolean}){


    return (
        <MainWrapper $mode={mode}>
 
        
        <BarWrapper $mode={mode} className="bar"  >
        {mode&& <Arrow className="arrow" icon={rightarrow} $mode="left"/>}
        {!mode&& <Arrow className="arrow" icon={leftarrow} $mode="right"/>}
        </BarWrapper>
        </MainWrapper>
    )
}
"use client"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCirclePlus as plusicon } from "@fortawesome/free-solid-svg-icons"
import { faCircleMinus as minusicon } from "@fortawesome/free-solid-svg-icons"

const Wrapper=styled.div`
    border: 1px solid blue;
    height: 40px;
    display: flex;
    justify-content: space-between;
     position: sticky;
  top: 0;
  z-index: 10;
    background-color: white;

`
const MainMenudiv=styled.div`
    display: flex;
    width: 500px;
    border: 1px solid red;
    justify-content: center;
    align-items: center;

`
const Emptydiv=styled.div`
    width: 35%;
`
const Minusdiv=styled.div`
    cursor: pointer;
`
const Plusdiv=styled.div`
    cursor: pointer;
`
//슬라이드바
const SliderContainer=styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    justify-content: center;
`

const SLiderdiv=styled.input`
        

`
const Numberdiv=styled.div`
    
`


const ViewmodeSelectdiv=styled.div`
    display: flex;
    border: 1px solid black;
    margin-left: auto;
    
`
const Viewmodemenu=styled.div`
    display: flex;
    
`
const Styleicon=styled(FontAwesomeIcon)`
    
`

type ViewModes = "single"|"double"|"webtoon" //유니온타입은string안되네
export default function ViewTop({
    viewmode,setViewmode,scale,setScale}:
    {
        viewmode:string,setViewmode:React.Dispatch<React.SetStateAction<ViewModes>>
        ,scale:number,setScale:React.Dispatch<React.SetStateAction<number>>
    }){
        const displayScale = Number((scale * 100).toFixed(0));

        const modes=[
            {key:"single" as ViewModes,label:"싱글"},
            {key:"double" as ViewModes,label:"더블"},
            {key:"webtoon" as ViewModes,label:"웹툰"}
        ]

        const minushandler=()=>{
            setScale(before => Number((Math.max(0.2, before - 0.1)).toFixed(3)));
        }

        const plushandler=()=>{
               setScale(before => Number((Math.min(1.2, before + 0.1)).toFixed(3)));
        }

    return (<Wrapper>
        <Emptydiv />
        <MainMenudiv>

       
    <Minusdiv onClick={minushandler}>
        <Styleicon icon={minusicon}/>
    </Minusdiv>
    <SliderContainer>
   
    <SLiderdiv type="range"
    min="20" max="120" step="10" 
    value={displayScale}
    onChange={(e)=>setScale(Number(e.target.value)/100)}
    />
    </SliderContainer>
   
   
    <Plusdiv onClick={plushandler}>
        <Styleicon icon={plusicon}/>
    </Plusdiv>

          <Numberdiv>
         {displayScale}
    </Numberdiv>
     </MainMenudiv>
        <ViewmodeSelectdiv>
            {modes.map(({key,label})=>(
                <Viewmodemenu key={key} onClick={()=>setViewmode(key)} >
                    {label}
                </Viewmodemenu>
            )

            )}
            
        </ViewmodeSelectdiv>
    </Wrapper>)
}
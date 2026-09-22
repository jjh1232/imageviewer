"use client"

import { useImages } from "@/app/(Context)/ImageProvider";
import { UserImageManager } from "@/app/(Tools)/UserImageManager";
import { Dispatch, SetStateAction } from "react";
import styled from "styled-components"

const Wrapper=styled.div`
    flex-shrink: 0;
    padding: 10px;
    border-bottom: 1px solid #e6e9ee;
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
export default function LeftTop(){
    const {images,addImages,removeImage}=useImages();

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
    return (
        <Wrapper>
           <UploadButton htmlFor="inputbutton" >인풋</UploadButton>
           <HiddenFileInput id="inputbutton" onChange={Inputhandler}/>

           
       
        </Wrapper>
    )
}
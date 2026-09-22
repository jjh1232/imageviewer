import type { Metadata } from "next";
import "./main1.css"
export const metadata: Metadata = {
  title: {
    default: "WebImageViewer",
    template:"%s | WebImageViewer"
  },
  description:"Web Image Viewing"
};

export default function MAIN(){
    return(

        <div className="MAINBOX">
          <div className="MAINBOX-first">
            {/* 예전에는 내용 없는 빈 <a> 라 화면에 테두리만 보였다.
                버튼 안에 무엇을 누르는 건지 글자로 남겨 둔다. */}
            <a href="/editor" className="MAIN_Viewbutton">
              <span className="MAIN_Viewbutton-icon" aria-hidden="true">🖼️</span>
              <span className="MAIN_Viewbutton-title">뷰어 열기</span>
              <span className="MAIN_Viewbutton-sub">이미지를 골라 바로 보기</span>
            </a>
          </div>

          <div className="MAINBOX-second">
            <h2>어떻게 쓰나</h2>
            <p>뷰어를 열고 왼쪽에서 이미지를 고르거나 끌어다 놓으면 됩니다. 한 장 보기, 두 장 보기, 웹툰 보기를 고를 수 있습니다.</p>
          </div>

          <div className="MAINBOX-third">
            <h2>설명 자리</h2>
            <p>여기에 들어갈 문구는 아직 정하지 않았습니다.</p>
          </div>
        </div>

    )
}

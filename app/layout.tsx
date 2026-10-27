import type { Metadata } from "next";

import "./globals.css";
import { THEME_KEY } from "./(Tools)/theme";

/** 첫 그림 전에 고른 테마를 붙인다. 안 고른 사람은 시스템 설정 그대로(globals.css). */
const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;




export const metadata: Metadata = {
  // canonical · hreflang 의 상대 주소가 이 주소 기준으로 풀린다. 배포 주소가 정해지면 env 로 넣는다.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "WebImageViewer",
    template:"%s | WebImageViewer"
  },
  description:"Web Image Viewing"
};

export default function RootLayout({children}:{children:React.ReactNode})
 {

  // suppressHydrationWarning — 아래 스크립트가 React 보다 먼저 data-theme 을 붙이므로
  // 서버 HTML 과 어긋나는 게 정상이다. <html> 한 단계에만 걸린다.
  return (
  <html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
  </head>
  <body>
    {children}
  </body>
  </html>
  );
}

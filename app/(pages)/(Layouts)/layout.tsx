import type { Metadata } from "next";
import "./globals.css";
import Topm from "../../(SUBLAYOUT)/TOP/page";
import Botttom from "../../(SUBLAYOUT)/BOTTOM/page";



export const metadata: Metadata = {
  title: {
    default: "WebImageViewer",
    template:"%s | WebImageViewer"
  },
  description:"Web Image Viewing"
};

export default function RootLayout({children}:{children:React.ReactNode})
 {

  return (
  <html lang="en">
    <head>
       <link rel="alternate" hrefLang="ko" href="https://localhost:3000/" />
        <link rel="alternate" hrefLang="en" href="https://localhost:3000/" />
    </head>
    <body>
    <div  className="MAINLAYOUT">
      <header className="MAINLAYOUT-header">
      
        <Topm />
      </header>
      
      {/* 2. 메인 콘텐츠 */}
      <main className="MAINLAYOUT-main">
        <div className="MAIN-left">

        </div>
        <div className="MAIN-center">
           {children}
        </div>
       
        <div className="MAIN-right">

        </div>
        </main>
      
      {/* 3. footer도 body 내부로 */}
      <footer className="MAINLAYOUT-footer">
        <Botttom/>
      </footer>
      </div>
    </body>
  </html>
  );
}

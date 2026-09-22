import type { Metadata } from "next";

import "./globals.css";




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
    {children}
  </body>
  </html>
  );
}

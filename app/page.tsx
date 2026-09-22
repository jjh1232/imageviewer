import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: {
    default: "WebImageViewer",
    template:"%s | WebImageViewer"
  },
  description:"Web Image Viewing"
};
export default function Home() {
    redirect('/MAIN');

  return (
    <html lang="en">
      
    </html>
  );
}

import { useCallback } from "react";

export interface ImageItem{
      id: string;
  url: string;
  title: string;
  size: number;
  type: string;
}

/* ── 큰 그림 줄이기 ────────────────────────────────────────────
 *
 * 9MB 짜리 PNG 를 그대로 물리면 브라우저의 이미지 번역이 무한 로딩에 빠진다.
 * 올릴 수 있는 크기를 넘기기 때문이다. 화면에 그리는 데도 이득이 없다 —
 * 어차피 화면 해상도 이상은 그려지지 않는다.
 *
 * 그래서 기준을 넘는 것만 WebP 로 다시 굽는다. 손실 압축이라 원본과 완전히
 * 같지는 않다. 원본 그대로 보고 싶으면 SHRINK_OVER 를 아주 크게 두면 된다.
 */

/** 이 크기를 넘는 파일만 다시 굽는다. */
const SHRINK_OVER = 2 * 1024 * 1024;   // 2MB

/** 긴 변을 이 이상으로는 두지 않는다. 요즘 화면이 대략 2560px 다. */
const MAX_EDGE = 2400;

/** WebP 품질. 0.9 면 눈으로는 원본과 구분이 어렵다. */
const QUALITY = 0.9;

async function shrink(file: File): Promise<Blob> {
    if (file.size <= SHRINK_OVER) return file;

    try {
        const bitmap = await createImageBitmap(file);
        const ratio = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * ratio);
        const height = Math.round(bitmap.height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return file;
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise<Blob | null>(
            (resolve) => canvas.toBlob(resolve, "image/webp", QUALITY)
        );

        // 다시 구웠는데 오히려 커졌으면 원본이 낫다.
        return blob && blob.size < file.size ? blob : file;
    } catch {
        // 브라우저가 못 읽는 형식이면 원본을 그대로 쓴다.
        return file;
    }
}

/**
 * 개발 서버에 올려두고 http 주소를 받는다.
 *
 * blob: 주소로 두면 브라우저의 이미지 번역이 바이트를 가져가지 못해 무한 로딩에 빠진다.
 * 구글 이미지처럼 http 주소를 주면 그 문제가 없다.
 * 올리지 못하면 blob: 으로 물러난다 — 보는 데는 지장이 없다.
 */
async function toServedUrl(blob: Blob, name: string): Promise<string> {
    try {
        const form = new FormData();
        form.append("file", new File([blob], name, { type: blob.type }));

        const res = await fetch("/api/images", { method: "POST", body: form });
        if (!res.ok) return URL.createObjectURL(blob);

        const { id } = await res.json();
        return `/api/images/${id}`;
    } catch {
        return URL.createObjectURL(blob);
    }
}

export const UserImageManager=()=>{
    //파일 변환
    const inputimages=useCallback(async (files:File[]):Promise<ImageItem[]>=>{
        const imageFiles = Array.from(files).filter(file=>file.type.startsWith('image/'));

        return Promise.all(imageFiles.map(async (file)=>{
            const blob = await shrink(file);
            return {
                id:crypto.randomUUID(),//아이디일단만들긴해
                url:await toServedUrl(blob, file.name),
                title:file.name,
                size:blob.size,        // 실제로 들고 있는 크기를 보여준다
                type:blob.type || file.type,
            };
        }));
    },[])

    return {inputimages};

}

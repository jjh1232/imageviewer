import { useCallback } from "react";

export interface ImageItem{
      id: string;
  url: string;
  title: string;
  size: number;
  type: string;
  /** 목록 보기에서 묶어 보여 줄 묶음. 주소 불러오기면 바깥 칸 값마다, 파일이면 한 번 열 때마다 하나. */
  group?: ImageGroup;
}

/** id 로 구분한다 — 따로 두 번 불러온 「a」 는 이름이 같아도 다른 묶음이다. */
export interface ImageGroup{ id: string; name: string }

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

/*
 * 파일은 blob: 주소로 들고 있는다. 서버로 보내지 않는다 — prelaps 는 정적 사이트다(헌법 §4).
 *
 * ⚠ 대가: 브라우저의 이미지 번역(웨일 등)이 blob: 의 바이트를 가져가지 못해 무한 로딩에 빠진다.
 *   예전엔 개발 서버(/api/images)에 올려 http 주소를 받아 피했다. 2026-10-27 prelaps 로 옮기며 뺐다.
 *   주소로 불러온 사진은 원래 http 주소라 상관없다. 다시 살리려면 서비스 워커로 같은 출처의
 *   http 주소를 흉내 내는 길이 있다 — 번역 기능이 그 경로를 타는지는 확인 안 됨.
 */

export const UserImageManager=()=>{
    //파일 변환
    const inputimages=useCallback(async (files:File[]):Promise<ImageItem[]>=>{
        const imageFiles = Array.from(files).filter(file=>file.type.startsWith('image/'));
        // 한 번 연 파일들이 한 묶음. 이름은 첫 파일 이름(폴더째 열었으면 대개 그 폴더의 첫 장이다).
        const group:ImageGroup={ id:crypto.randomUUID(), name:imageFiles[0]?.name ?? "" };

        return Promise.all(imageFiles.map(async (file)=>{
            const blob = await shrink(file);
            return {
                id:crypto.randomUUID(),//아이디일단만들긴해
                url:URL.createObjectURL(blob),
                title:file.name,
                size:blob.size,        // 실제로 들고 있는 크기를 보여준다
                type:blob.type || file.type,
                group,
            };
        }));
    },[])

    return {inputimages};

}

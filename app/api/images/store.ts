/**
 * 올린 이미지를 잠깐 들고 있는 곳.
 *
 * blob: 주소는 페이지 안에서만 유효해서, 브라우저의 이미지 번역 같은 기능이
 * 바이트를 가져가지 못하고 무한 로딩에 빠진다. 그래서 개발 서버가 잠깐 들고 있다가
 * http 주소로 돌려준다 — 구글 이미지에서 번역이 되는 것과 같은 모양이 된다.
 *
 * 메모리에만 둔다. 서버를 끄면 사라진다. 테스트용이라 이 정도로 충분하다.
 * 실제로 쓸 거면 용량 상한과 만료를 붙여야 한다.
 */
export type Stored = { bytes: Uint8Array; type: string };

// 개발 중 파일이 다시 읽히면 모듈이 새로 만들어진다.
// globalThis 에 붙여야 그때 올려둔 이미지가 안 날아간다.
const g = globalThis as unknown as { __imageStore?: Map<string, Stored> };

export const imageStore: Map<string, Stored> = g.__imageStore ?? new Map();
g.__imageStore = imageStore;

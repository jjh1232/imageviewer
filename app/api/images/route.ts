import { imageStore } from "./store";

/** 파일을 받아 id 를 돌려준다. 이후 /api/images/<id> 로 꺼내 쓴다. */
export async function POST(request: Request) {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
        return Response.json({ error: "file 이 없다" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    imageStore.set(id, {
        bytes: new Uint8Array(await file.arrayBuffer()),
        type: file.type || "application/octet-stream",
    });

    return Response.json({ id });
}

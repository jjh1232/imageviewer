import { imageStore } from "../store";

/** 올려둔 이미지를 그대로 돌려준다. */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const found = imageStore.get(id);

    if (!found) return new Response("없음", { status: 404 });

    return new Response(found.bytes as unknown as BodyInit, {
        headers: {
            "Content-Type": found.type,
            "Cache-Control": "no-store",
        },
    });
}

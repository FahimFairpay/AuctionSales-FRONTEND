import { NextRequest, NextResponse } from "next/server";

const API_BASE = (
  process.env.API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  ""
).replace(/\/+$/, "");

export async function proxyApiRequest(
  req: NextRequest,
  customPath?: string
): Promise<NextResponse> {
  if (!API_BASE) {
    return NextResponse.json(
      {
        success: false,
        message: "API Gateway Proxy Error: NEXT_PUBLIC_API_BASE is not configured in .env.local",
      },
      { status: 500 }
    );
  }

  const rawPath = customPath || req.nextUrl.pathname;
  const subpath = rawPath.replace(/^\/api(\/|$)/, "/");
  const search = req.nextUrl.search;
  const targetUrl = `${API_BASE}${subpath.startsWith("/") ? "" : "/"}${subpath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!["host", "connection", "content-length", "transfer-encoding"].includes(lower)) {
      headers.set(key, value);
    }
  });

  // Prefer the token the browser sent in X-Fair-Token.
  const fairToken = headers.get("x-fair-token");
  if (fairToken) {
    headers.set("authorization", fairToken);
    headers.delete("x-fair-token");
  }

  const body = ["GET", "HEAD"].includes(req.method)
    ? undefined
    : await req.arrayBuffer();

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    res.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding", "content-length"].includes(lower)) {
        responseHeaders.set(key, val);
      }
    });

    responseHeaders.set("x-handled-by", "nextjs-route-ts");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `API Gateway Proxy Error: ${error?.message || String(error)}`,
        targetUrl,
      },
      { status: 502 }
    );
  }
}

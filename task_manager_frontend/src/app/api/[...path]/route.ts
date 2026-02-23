import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUBLIC_INTERFACE
export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  /** Proxies GET requests from the frontend to the backend API. */
  return proxy(request, context);
}

// PUBLIC_INTERFACE
export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  /** Proxies POST requests from the frontend to the backend API. */
  return proxy(request, context);
}

// PUBLIC_INTERFACE
export async function PUT(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  /** Proxies PUT requests from the frontend to the backend API. */
  return proxy(request, context);
}

// PUBLIC_INTERFACE
export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  /** Proxies PATCH requests from the frontend to the backend API. */
  return proxy(request, context);
}

// PUBLIC_INTERFACE
export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  /** Proxies DELETE requests from the frontend to the backend API. */
  return proxy(request, context);
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await context.params;

  // Non-public env var (server-side only).
  const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!backendBase) {
    return NextResponse.json(
      {
        message:
          "Backend URL not configured. Set BACKEND_URL (preferred) or NEXT_PUBLIC_API_BASE_URL.",
      },
      { status: 500 }
    );
  }

  const base = backendBase.replace(/\/+$/, "");
  const url = new URL(request.url);

  const targetUrl = `${base}/${path.map(encodeURIComponent).join("/")}${url.search}`;

  // Forward headers (esp Authorization) but avoid sending hop-by-hop headers.
  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    // Only forward body for non-GET/HEAD.
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  };

  const resp = await fetch(targetUrl, init);

  // Stream response back with status and headers.
  const outHeaders = new Headers(resp.headers);
  // CORS is handled by browser same-origin call; no need to expose backend CORS here.
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: outHeaders,
  });
}

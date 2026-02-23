// PUBLIC_INTERFACE
export async function GET() {
  /** Health check endpoint for the frontend container. */
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

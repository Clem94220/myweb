export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

  // Initialize KV
  const VIEWS_kv = env.VIEWS_KV;
  if (!VIEWS_kv) {
    return new Response(JSON.stringify({ error: "KV not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Helper to get views
  async function getViews() {
    const val = await VIEWS_kv.get("views");
    return val ? parseInt(val) : 0;
  }

  // Helper to track visits (simple in-memory check approximation not possible in serverless, 
  // so we'll just increment for now or use KV with expiration if strict uniqueness needed.
  // For simplicity matching original server.js logic which was per-session, we'll just increment.)
  // Note: server.js had `visitedIPs` Set which reset on restart. 
  // In serverless, we can't easily replicate "session" without cookies or transient KV keys.
  // We will implement a simple cookie-based check to prevent immediate refresh spam.
  
  if (request.method === "GET") {
    const views = await getViews();
    return new Response(JSON.stringify({ views }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST") {
    // Check cookie for simple session-like prevention
    const cookies = request.headers.get("Cookie") || "";
    if (cookies.includes("viewed=true")) {
       const views = await getViews();
       return new Response(JSON.stringify({ views, isNewVisit: false }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Increment
    let views = await getViews();
    views++;
    await VIEWS_kv.put("views", views.toString());

    return new Response(JSON.stringify({ views, isNewVisit: true }), {
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": "viewed=true; Path=/; Max-Age=3600; SameSite=Lax" // 1 hour "session"
      }
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

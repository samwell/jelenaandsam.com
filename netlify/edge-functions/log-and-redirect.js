// netlify/edge-functions/log-and-redirect.js

export default async (request, context) => {
  const ip = extractClientIp(request);
  const geo = await fetchGeoIP(ip, "74934ba5bd4116");

  const data = {
    timestamp: new Date().toISOString(),
    ip,
    userAgent: request.headers.get("user-agent") || "unknown",
    referrer: request.headers.get("referer") || "none",
    location: geo?.city ? `${geo.city}, ${geo.region}, ${geo.country}` : "unknown",
    org: geo?.org || "unknown",
  };

  console.log("[log-and-redirect] Visitor data:", JSON.stringify(data));

  // Send data to Make.com webhook
  await fetch("https://hook.us2.make.com/uunvc02im8c4xv0nbvik97c2lz2l5c4t", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

    // Redirect to WithJoy site
  return Response.redirect("https://withjoy.com/jelenaandsam", 301);
};

export const config = {
  path: "/*",
};

function extractClientIp(request) {
  const clientIp = request.headers.get("x-nf-client-connection-ip");
  if (clientIp) return clientIp;

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // Handle comma-separated list and trim
    return xff.split(",")[0].trim();
  }

  return "unknown";
}

async function fetchGeoIP(ip, token) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`);
    if (!res.ok) throw new Error("GeoIP fetch failed");
    return await res.json();
  } catch (err) {
    console.error("[log-and-redirect] GeoIP error:", err);
    return null;
  }
}
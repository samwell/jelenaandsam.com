// netlify/edge-functions/log-and-redirect.js

export default async (request, context) => {
  const data = {
    timestamp: new Date().toISOString(),
    ip: extractClientIp(request),
    userAgent: request.headers.get("user-agent") || "unknown",
    referrer: request.headers.get("referer") || "none",
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
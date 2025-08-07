// netlify/edge-functions/log-and-redirect.js

export default async (request, context) => {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || "none";
    const timestamp = new Date().toISOString();
  
    // Log to Netlify's function log (can be viewed in Netlify logs)
    console.log(`[${timestamp}] Redirect triggered`);
    console.log(`IP: ${ip}`);
    console.log(`User-Agent: ${userAgent}`);
    console.log(`Referrer: ${referrer}`);
  
    // Optional: send log to an external endpoint (e.g., Google Sheets, webhook)
    // await fetch("https://your-logging-endpoint.com", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ timestamp, ip, userAgent, referrer })
    // });
  
    // Redirect to WithJoy site
    return Response.redirect("https://withjoy.com/jelenaandsam", 301);
  };
  
  export const config = {
    path: "/*",
};
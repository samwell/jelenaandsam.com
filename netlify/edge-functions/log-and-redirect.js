// netlify/edge-functions/log-and-redirect.js

export default async (request, context) => {
  const ip = extractClientIp(request);
  const geo = await fetchGeoIP(ip, "74934ba5bd4116");
  const userAgentString = request.headers.get("user-agent") || "unknown";
  const { deviceType, browser, os } = parseUserAgent(userAgentString);

  const data = {
    timestamp: new Date().toISOString(),
    ip,
    userAgent: request.headers.get("user-agent") || "unknown",
    referrer: request.headers.get("referer") || "none",
    geo: {
      city: geo?.city || "unknown",
      region: geo?.region || "unknown",
      country: geo?.country || "unknown",
      postal: geo?.postal || "unknown",
      org: geo?.org || "unknown",
    },
    deviceType,
    browser,
    os,
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

function parseUserAgent(ua) {
  // Device type
  const isMobile = /Mobile|Android|iPhone|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  // Browser detection
  let browser = "Unknown";
  let browserVersion = "";

  if (/Chrome\/([\d.]+)/.test(ua)) {
    browser = "Chrome";
    browserVersion = RegExp.$1;
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    browser = "Firefox";
    browserVersion = RegExp.$1;
  } else if (/Safari\/([\d.]+)/.test(ua) && /Version\/([\d.]+)/.test(ua)) {
    browser = "Safari";
    browserVersion = RegExp.$1;
  } else if (/Edg\/([\d.]+)/.test(ua)) {
    browser = "Edge";
    browserVersion = RegExp.$1;
  } else if (/OPR\/([\d.]+)/.test(ua)) {
    browser = "Opera";
    browserVersion = RegExp.$1;
  }

  // OS detection
  let os = "Unknown OS";
  let osVersion = "";

  if (/Windows NT ([\d.]+)/.test(ua)) {
    os = "Windows";
    osVersion = RegExp.$1;
  } else if (/Mac OS X ([\d_]+)/.test(ua)) {
    os = "macOS";
    osVersion = RegExp.$1.replace(/_/g, ".");
  } else if (/Android ([\d.]+)/.test(ua)) {
    os = "Android";
    osVersion = RegExp.$1;
  } else if (/iPhone OS ([\d_]+)/.test(ua)) {
    os = "iOS";
    osVersion = RegExp.$1.replace(/_/g, ".");
  } else if (/iPad; CPU OS ([\d_]+)/.test(ua)) {
    os = "iPadOS";
    osVersion = RegExp.$1.replace(/_/g, ".");
  }

  return {
    deviceType,
    browser: `${browser} ${browserVersion}`,
    os: `${os} ${osVersion}`,
  };
}
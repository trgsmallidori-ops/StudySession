import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In-memory rate limit store: key -> timestamps of requests in last window
const rateLimitStore = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; // 1 minute

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getRouteType(pathname: string): "auth" | "contact" | "api" | null {
  if (["/login", "/signup", "/reset-password"].some((p) => pathname.startsWith(p))) {
    return "auth";
  }
  if (pathname.startsWith("/api/contact")) {
    return "contact";
  }
  if (pathname.startsWith("/api/")) {
    return "api";
  }
  return null;
}

function isRateLimited(ip: string, routeType: "auth" | "contact" | "api"): boolean {
  const limits = { auth: 10, contact: 5, api: 60 };
  const key = `${ip}:${routeType}`;
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let timestamps = rateLimitStore.get(key) ?? [];
  timestamps = timestamps.filter((t) => t > cutoff);

  if (timestamps.length >= limits[routeType]) {
    return true;
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const routeType = getRouteType(pathname);

  if (routeType) {
    const ip = getClientIp(request);
    if (isRateLimited(ip, routeType)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

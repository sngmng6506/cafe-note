import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: await isAuthenticatedRequest(request) });
}

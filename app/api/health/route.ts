import { NextResponse } from "next/server";

/** Liveness probe for Vercel / Docker / uptime monitors. */
export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "jobtrackr", time: new Date().toISOString() },
    { status: 200 }
  );
}

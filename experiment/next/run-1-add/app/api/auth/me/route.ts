import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/server/http";
import { toPublicUser } from "@/server/store";

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ user: toPublicUser(auth.user) });
}

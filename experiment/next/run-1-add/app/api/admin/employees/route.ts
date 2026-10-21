import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/server/http";
import { listEmployees } from "@/server/store";

export async function GET(request: NextRequest) {
  const auth = await requireUser(request, "admin");
  if (auth.response) return auth.response;
  return NextResponse.json({ employees: listEmployees() });
}

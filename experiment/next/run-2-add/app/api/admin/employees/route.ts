import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { listEmployees } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;
  return Response.json({ employees: listEmployees() });
}

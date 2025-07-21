import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const c = cookies();
  c.delete("accessToken");
  return NextResponse.json({ status: "200", message: "Logged out" });
}

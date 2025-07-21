import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const api = process.env.APILINK;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${api}/admin/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body }),
  });
  const data = await res.json();
  console.log(data);
  if (data.status === "success") {
    cookies().set("accessToken", data.Token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    delete data.accessToken;
    return NextResponse.json({ ...data });
  }
  return NextResponse.json({ ...data });
}

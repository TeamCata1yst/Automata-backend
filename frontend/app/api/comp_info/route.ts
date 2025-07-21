import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const api = process.env.NEXT_PUBLIC_APILINK;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${api}/org/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: body.accessToken,
    },
    body: JSON.stringify({
      comp_name: body.comp_name,
      address: body.address,
      comp_phone: body.comp_phone,
      first_day: body.first_day,
      hours: body.hours,
      weekend: body.weekend,
      start_time: body.start_time,
      linkedin: body.linkedin,
      facebook: body.facebook,
      instagram: body.instagram,
      twitter: body.twitter,
    }),
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

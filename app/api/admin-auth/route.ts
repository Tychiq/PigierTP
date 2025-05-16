import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const inputPasskey = body.passkey;

  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return NextResponse.json(
      { success: false, message: "Server misconfiguration" },
      { status: 500 }
    );
  }

  if (inputPasskey === secret) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, message: "Clé d'accès incorrecte" },
      { status: 401 }
    );
  }
}
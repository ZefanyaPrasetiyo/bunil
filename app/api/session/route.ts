import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Sesi pengguna tidak ditemukan", status: 401, data: null },
        { status: 401 },
      );
    }

    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { message: "Gagal memeriksa sesi pengguna", status: 500, data: null },
      { status: 500 },
    );
  }
}

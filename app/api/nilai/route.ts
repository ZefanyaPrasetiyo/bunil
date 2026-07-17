import { NextResponse, type NextRequest } from "next/server";
import { createNilai, deleteNilai, getNilaiById, getNilais, updateNilai } from "../../../lib/nilai";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const nilai = await getNilaiById(id);

    if (!nilai) {
      return NextResponse.json(
        { message: "Nilai tidak ditemukan", status: 404, data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Nilai ditemukan", status: 200, data: nilai });
  }

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;

  const data = await getNilais(page, limit);
  return NextResponse.json({ message: "Daftar nilai berhasil diambil", status: 200, ...data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createNilai(body);

    return NextResponse.json(
      { message: "Nilai berhasil dibuat", status: 201, data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal membuat nilai", status: 400, data: null, details: error },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID nilai wajib diisi", status: 400, data: null },
        { status: 400 }
      );
    }

    const result = await updateNilai(id, data);
    return NextResponse.json({ message: "Nilai berhasil diubah", status: 200, data: result });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengubah nilai", status: 400, data: null, details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const id = body?.id ?? request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID nilai wajib diisi", status: 400, data: null },
        { status: 400 }
      );
    }

    const result = await deleteNilai(id);
    return NextResponse.json({ message: "Nilai berhasil dihapus", status: 200, data: result });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menghapus nilai", status: 400, data: null, details: error },
      { status: 400 }
    );
  }
}

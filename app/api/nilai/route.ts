import { NextResponse, type NextRequest } from "next/server";
import { createNilai, deleteNilai, getNilaiById, getNilais, updateNilai } from "../../../lib/nilai";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const nilai = await getNilaiById(id);

    if (!nilai) {
      return NextResponse.json({ error: "Nilai tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(nilai);
  }

  const data = await getNilais();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createNilai(body);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat nilai", details: error },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID nilai wajib diisi" }, { status: 400 });
    }

    const result = await updateNilai(id, data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengubah nilai", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const id = body?.id ?? request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID nilai wajib diisi" }, { status: 400 });
    }

    const result = await deleteNilai(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus nilai", details: error },
      { status: 400 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { deleteNilai, getNilaiById, updateNilai } from "../../../../lib/nilai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getNilaiById(id);

  if (!data) {
    return NextResponse.json({ error: "Nilai tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateNilai(id, body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengubah nilai", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await deleteNilai(id);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus nilai", details: error },
      { status: 400 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { deleteMataPelajaran, getMataPelajaranById, updateMataPelajaran } from "../../../../lib/mata-pelajaran";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getMataPelajaranById(id);

  if (!data) {
    return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
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
    const data = await updateMataPelajaran(id, body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengubah mata pelajaran", details: error },
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
    const data = await deleteMataPelajaran(id);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus mata pelajaran", details: error },
      { status: 400 }
    );
  }
}

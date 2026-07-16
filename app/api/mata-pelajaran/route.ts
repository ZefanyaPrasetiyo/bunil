import { NextResponse, type NextRequest } from "next/server";
import {
  createMataPelajaran,
  deleteMataPelajaran,
  getMataPelajaranById,
  getMataPelajarans,
  updateMataPelajaran,
} from "../../../lib/mata-pelajaran";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const mataPelajaran = await getMataPelajaranById(id);

    if (!mataPelajaran) {
      return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(mataPelajaran);
  }

  const data = await getMataPelajarans();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createMataPelajaran(body);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat mata pelajaran", details: error },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID mata pelajaran wajib diisi" }, { status: 400 });
    }

    const result = await updateMataPelajaran(id, data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengubah mata pelajaran", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const id = body?.id ?? request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID mata pelajaran wajib diisi" }, { status: 400 });
    }

    const result = await deleteMataPelajaran(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus mata pelajaran", details: error },
      { status: 400 }
    );
  }
}

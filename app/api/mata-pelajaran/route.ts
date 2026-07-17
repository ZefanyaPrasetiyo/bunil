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
      return NextResponse.json(
        { message: "Mata pelajaran tidak ditemukan", status: 404, data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Mata pelajaran ditemukan", status: 200, data: mataPelajaran });
  }

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;

  const data = await getMataPelajarans(page, limit);
  return NextResponse.json({ message: "Daftar mata pelajaran berhasil diambil", status: 200, ...data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createMataPelajaran(body);

    return NextResponse.json(
      { message: "Mata pelajaran berhasil dibuat", status: 201, data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal membuat mata pelajaran", status: 400, data: null, details: error },
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
        { message: "ID mata pelajaran wajib diisi", status: 400, data: null },
        { status: 400 }
      );
    }

    const result = await updateMataPelajaran(id, data);
    return NextResponse.json({ message: "Mata pelajaran berhasil diubah", status: 200, data: result });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengubah mata pelajaran", status: 400, data: null, details: error },
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
        { message: "ID mata pelajaran wajib diisi", status: 400, data: null },
        { status: 400 }
      );
    }

    const result = await deleteMataPelajaran(id);
    return NextResponse.json({ message: "Mata pelajaran berhasil dihapus", status: 200, data: result });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menghapus mata pelajaran", status: 400, data: null, details: error },
      { status: 400 }
    );
  }
}

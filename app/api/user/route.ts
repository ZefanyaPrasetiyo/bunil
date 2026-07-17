import { NextResponse, type NextRequest } from "next/server";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../../../lib/user";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan", status: 404, data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User ditemukan", status: 200, data: user });
  }

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;

  const users = await getUsers(page, limit);
  return NextResponse.json({ message: "Daftar user berhasil diambil", status: 200, ...users });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser(body);

    return NextResponse.json(
      { message: "User berhasil dibuat", status: 201, data: user },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal membuat user", status: 400, data: null, details: error },
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
        { message: "ID user wajib diisi", status: 400, data: null },
        { status: 400 }
      );
    }

    const user = await updateUser(id, data);
    return NextResponse.json({ message: "User berhasil diubah", status: 200, data: user });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengubah user", status: 400, data: null, details: error },
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
        { message: "ID user wajib diisi", status: 400, data: null },
        { status: 400 }
      );
    }

    const user = await deleteUser(id);
    return NextResponse.json({ message: "User berhasil dihapus", status: 200, data: user });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menghapus user", status: 400, data: null, details: error },
      { status: 400 }
    );
  }
}

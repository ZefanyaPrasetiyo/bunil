import { NextResponse, type NextRequest } from "next/server";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../../../lib/user";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  }

  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat user", details: error },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    const user = await updateUser(id, data);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengubah user", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const id = body?.id ?? request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    const user = await deleteUser(id);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus user", details: error },
      { status: 400 }
    );
  }
}

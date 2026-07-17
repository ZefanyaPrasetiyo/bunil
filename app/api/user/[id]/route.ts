import { NextResponse, type NextRequest } from "next/server";
import { deleteUser, getUserById, updateUser } from "../../../../lib/user";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await updateUser(id, body);

    return NextResponse.json(user);
  } catch (error) {
     console.error(error);
    return NextResponse.json(
      { error: "Gagal mengubah user", details: error },
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
    const user = await deleteUser(id);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus user", details: error },
      { status: 400 }
    );
  }
}

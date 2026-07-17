import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { jwt } from "better-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "username dan password wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "User belum memiliki password",
        },
        {
          status: 400,
        }
      );
    }

    const validpassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validpassword) {
      return NextResponse.json(
        {
          success: false,
          message: "password salah",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role,
        jurusan: user.jurusan,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { businessName, email, password, phone, address } = await request.json();

    // Validate required fields
    if (!businessName || !email || !password || !phone || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "BUSINESS_ADMIN",
      },
    });

    // Create new business
    const newBusiness = await prisma.business.create({
      data: {
        name: businessName,
        email,
        phone,
        address,
        adminId: newUser.id,
      },
    });

    return NextResponse.json(
      { success: true, user: newUser, business: newBusiness },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
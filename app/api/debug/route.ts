import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await db.select().from(user);
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(u => ({ id: u.id, email: u.email, role: u.role, isVerified: u.isVerified }))
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}

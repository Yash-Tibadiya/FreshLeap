import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, verifyCode } = body;
    
    if (!username || !verifyCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and verification code are required",
        },
        { status: 400 }
      );
    }
    
    // Find user by username
    const users = await db.select().from(Users).where(eq(Users.username, username));
    
    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    
    const user = users[0];
    
    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email is already verified",
        },
        { status: 200 }
      );
    }
    
    // Check if verification code is valid
    if (user.verifyCode !== verifyCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 }
      );
    }
    
    // Check if verification code has expired
    const now = new Date();
    if (user.verifyCodeExpiry && user.verifyCodeExpiry < now) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new one",
        },
        { status: 400 }
      );
    }
    
    // Update user as verified
    await db
      .update(Users)
      .set({
        isVerified: true,
        verifyCode: null,
        verifyCodeExpiry: null,
        updated_at: now,
      })
      .where(eq(Users.user_id, user.user_id));
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-email route:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during email verification",
      },
      { status: 500 }
    );
  }
}
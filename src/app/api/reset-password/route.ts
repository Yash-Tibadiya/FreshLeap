import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

// Function to hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  // Generate a salt with cost factor 10 (recommended default)
  const saltRounds = 10;
  
  // Hash the password with the generated salt
  const hashedPassword = await bcryptjs.hash(password, saltRounds);
  
  return hashedPassword;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, password } = body;
    
    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token and new password are required",
        },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }
    
    // Find user by reset token (stored in verifyCode field)
    const users = await db.select().from(Users).where(eq(Users.verifyCode, token));
    
    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset token",
        },
        { status: 400 }
      );
    }
    
    const user = users[0];
    
    // Check if reset token has expired
    const now = new Date();
    if (!user.verifyCodeExpiry || user.verifyCodeExpiry < now) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token has expired. Please request a new password reset link",
        },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    
    // Update user with new password and clear reset token
    await db
      .update(Users)
      .set({
        password: hashedPassword,
        verifyCode: null,
        verifyCodeExpiry: null,
        updated_at: now,
      })
      .where(eq(Users.user_id, user.user_id));
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-password route:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resetting password",
      },
      { status: 500 }
    );
  }
}
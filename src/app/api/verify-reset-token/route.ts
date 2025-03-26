import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token is required",
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
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Reset token is valid",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-reset-token route:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while verifying reset token",
      },
      { status: 500 }
    );
  }
}
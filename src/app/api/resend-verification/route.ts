import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { username } = body;
    
    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required",
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
          success: false,
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }
    
    // Check if email and username are available
    if (!user.email || !user.username) {
      return NextResponse.json(
        {
          success: false,
          message: "User email or username is missing",
        },
        { status: 400 }
      );
    }
    
    // Generate new verification code (6-digit number)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set verification code expiry (10 minutes from now)
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setMinutes(verifyCodeExpiry.getMinutes() + 10);
    
    // Current timestamp
    const now = new Date();
    
    // Update user with new verification code
    await db
      .update(Users)
      .set({
        verifyCode,
        verifyCodeExpiry,
        updated_at: now,
      })
      .where(eq(Users.user_id, user.user_id));
    
    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.username, verifyCode);
    
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.message);
      
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Please try again later.",
        },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Verification code has been resent. Please check your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in resend-verification route:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resending verification code",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send password reset email
async function sendPasswordResetEmail(email: string, username: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const { error } = await resend.emails.send({
      from: "FreshLeap <dev@yash14.me>", // Use Resend's default domain for development
      to: email,
      subject: "Reset Your Password - FreshLeap",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hello ${username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>The FreshLeap Team</p>
        </div>
      `,
    });
    
    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: "Password reset email sent successfully" };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, message: "Failed to send password reset email" };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }
    
    // Find user by email
    const users = await db.select().from(Users).where(eq(Users.email, email));
    
    // Don't reveal if the email exists or not for security reasons
    if (users.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "If your email is registered, you will receive a password reset link shortly",
        },
        { status: 200 }
      );
    }
    
    const user = users[0];
    
    // Check if username is available
    if (!user.username) {
      return NextResponse.json(
        {
          success: true,
          message: "If your email is registered, you will receive a password reset link shortly",
        },
        { status: 200 }
      );
    }
    
    // Generate reset token (random 32-byte hex string)
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Set reset token expiry (1 hour from now)
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
    
    // Current timestamp
    const now = new Date();
    
    // Update user with reset token (using verifyCode field for reset token)
    await db
      .update(Users)
      .set({
        verifyCode: resetToken,
        verifyCodeExpiry: resetTokenExpiry,
        updated_at: now,
      })
      .where(eq(Users.user_id, user.user_id));
    
    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, user.username, resetToken);
    
    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.message);
      
      // Don't reveal the error to the client for security reasons
      return NextResponse.json(
        {
          success: true,
          message: "If your email is registered, you will receive a password reset link shortly",
        },
        { status: 200 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "If your email is registered, you will receive a password reset link shortly",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
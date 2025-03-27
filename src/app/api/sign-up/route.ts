import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Users, Farmers, roleEnum } from "@/db/schema";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["farmer", "customer"]),
  // Farmer-specific fields (optional, required only if role is "farmer")
  farmName: z.string().optional(),
  farmLocation: z.string().optional(),
  contactNumber: z.string().optional(),
});

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
    
    // Validate request data
    const validationResult = signUpSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { username, email, password, role } = validationResult.data;
    
    // Check if user with email already exists
    const existingUserByEmail = await db.select().from(Users).where(eq(Users.email, email));
    
    if (existingUserByEmail.length > 0) {
      const existingUser = existingUserByEmail[0];
      
      // If the user exists but is not verified, update their details and send a new code
      if (!existingUser.isVerified) {
        // Generate new verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set verification code expiry (10 minutes from now)
        const verifyCodeExpiry = new Date();
        verifyCodeExpiry.setMinutes(verifyCodeExpiry.getMinutes() + 10);
        
        // Hash the new password
        const hashedPassword = await hashPassword(password);
        
        // Current timestamp
        const now = new Date();
        
        // Update the existing user with new details
        const [updatedUser] = await db
          .update(Users)
          .set({
            username,
            password: hashedPassword,
            role: role as typeof roleEnum.enumValues[number],
            verifyCode,
            verifyCodeExpiry,
            updated_at: now,
          })
          .where(eq(Users.user_id, existingUser.user_id))
          .returning();
        
        // If role is farmer, update or create farmer record
        if (role === "farmer") {
          const { farmName, farmLocation, contactNumber } = validationResult.data;
          
          // Validate farmer-specific fields
          if (!farmName || !farmLocation || !contactNumber) {
            return NextResponse.json(
              {
                success: false,
                message: "Farm details are required for farmer registration",
              },
              { status: 400 }
            );
          }
          
          // Check if farmer record exists
          const existingFarmer = await db.select().from(Farmers).where(eq(Farmers.user_id, existingUser.user_id));
          
          if (existingFarmer.length > 0) {
            // Update existing farmer record
            await db
              .update(Farmers)
              .set({
                farm_name: farmName,
                farm_location: farmLocation,
                contact_number: contactNumber,
                updated_at: now,
              })
              .where(eq(Farmers.user_id, existingUser.user_id));
          } else {
            // Create new farmer record
            await db.insert(Farmers).values({
              user_id: existingUser.user_id,
              farm_name: farmName,
              farm_location: farmLocation,
              contact_number: contactNumber,
              created_at: now,
              updated_at: now,
            });
          }
        }
        
        // Send verification email
        const emailResult = await sendVerificationEmail(email, username, verifyCode);
        
        if (!emailResult.success) {
          console.error("Failed to send verification email:", emailResult.message);
          // We don't want to fail the sign-up process if email sending fails
          // Just log the error and continue
        }
        
        // Return success response
        return NextResponse.json(
          {
            success: true,
            message: "User details updated and new verification code sent. Please check your email.",
            user: {
              id: updatedUser.user_id,
              username: updatedUser.username,
              email: updatedUser.email,
              role: updatedUser.role,
            },
          },
          { status: 200 }
        );
      } else {
        // If the user is already verified, return an error
        return NextResponse.json(
          {
            success: false,
            message: "Email already in use",
          },
          { status: 409 }
        );
      }
    }
    
    // Check if username is already taken
    const existingUserByUsername = await db.select().from(Users).where(eq(Users.username, username));
    
    if (existingUserByUsername.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 409 }
      );
    }
    
    // Hash password with bcrypt (await the Promise)
    const hashedPassword = await hashPassword(password);
    
    // Generate verification code (6-digit number)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set verification code expiry (10 minutes from now)
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setMinutes(verifyCodeExpiry.getMinutes() + 10);
    
    // Current timestamp
    const now = new Date();
    
    // Create user
    const [newUser] = await db
      .insert(Users)
      .values({
        username,
        email,
        password: hashedPassword,
        role: role as typeof roleEnum.enumValues[number],
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        created_at: now,
        updated_at: now,
      })
      .returning();
    
    // If role is farmer, create farmer record
    if (role === "farmer") {
      const { farmName, farmLocation, contactNumber } = validationResult.data;
      
      // Validate farmer-specific fields
      if (!farmName || !farmLocation || !contactNumber) {
        // Delete the user we just created
        await db.delete(Users).where(eq(Users.user_id, newUser.user_id));
        
        return NextResponse.json(
          {
            success: false,
            message: "Farm details are required for farmer registration",
          },
          { status: 400 }
        );
      }
      
      // Create farmer record
      await db.insert(Farmers).values({
        user_id: newUser.user_id,
        farm_name: farmName,
        farm_location: farmLocation,
        contact_number: contactNumber,
        created_at: now,
        updated_at: now,
      });
    }
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, username, verifyCode);
    
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.message);
      // We don't want to fail the sign-up process if email sending fails
      // Just log the error and continue
    }
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
        user: {
          id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in sign-up route:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration",
      },
      { status: 500 }
    );
  }
}

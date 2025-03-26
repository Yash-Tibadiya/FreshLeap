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

export type SignUpSchema = z.infer<typeof signUpSchema>;
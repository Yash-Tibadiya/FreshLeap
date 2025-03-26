export type Role = "farmer" | "customer";

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  role: Role;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  created_at: Date;
  updated_at: Date;
}

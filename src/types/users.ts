export type Role = "farmer" | "customer";

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

"use client";

import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

// Form validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecking, setTokenChecking] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Verify token validity when component mounts
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setApiError("Invalid or missing reset token. Please request a new password reset link.");
        setTokenChecking(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-reset-token?token=${token}`, {
          method: "GET",
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setTokenValid(false);
          setApiError(data.message || "Invalid or expired reset token. Please request a new password reset link.");
          setTokenChecking(false);
          return;
        }
        
        setTokenValid(true);
        setTokenChecking(false);
      } catch (error) {
        console.error("Token verification error:", error);
        setTokenValid(false);
        setApiError("An error occurred while verifying the reset token. Please try again.");
        setTokenChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccess(null);
    
    if (!token) {
      toast.error("Reset failed", {
        description: "Reset token is missing. Please request a new password reset link.",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Send request to reset-password API
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        toast.error("Reset failed", {
          description: responseData.message || "Failed to reset password. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Successfully reset password
      setSuccess("Your password has been reset successfully! Redirecting to sign in...");
      toast.success("Password reset", {
        description: "Your password has been reset successfully!",
      });
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Reset failed", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking token
  if (tokenChecking) {
    return (
      <div className="relative flex min-h-screen transition-colors duration-300 bg-white dark:bg-black dark:bg-gradient-to-tr bg-gradient-to-tr from-white to-green-950 dark:from-black dark:to-green-900 overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full p-4 sm:p-8 md:p-12 z-10">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="animate-pulse">
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Verifying reset link...
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Please wait while we verify your password reset link.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="relative flex min-h-screen transition-colors duration-300 bg-white dark:bg-black dark:bg-gradient-to-tr bg-gradient-to-tr from-white to-green-950 dark:from-black dark:to-green-900 overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full p-4 sm:p-8 md:p-12 z-10">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {apiError || "The password reset link is invalid or has expired."}
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <Link 
                href="/forgot-password" 
                className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
              >
                Request a new password reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex min-h-screen transition-colors duration-300 bg-white dark:bg-black dark:bg-gradient-to-tr bg-gradient-to-tr from-white to-green-950 dark:from-black dark:to-green-900 overflow-hidden">
        {/* Form Content */}
        <div className="flex flex-col items-start justify-center w-full p-4 sm:p-8 md:p-12 lg:pl-20 lg:pr-0 z-10">
          <div className="w-full max-w-lg lg:pl-20">
            <div className="mb-8 space-y-4">
              <div className="w-16 h-16 mb-2">
                <Link href="/" aria-label="go home">
                  <Image
                    src="/images/logo.png"
                    alt="FreshLeap"
                    width={64}
                    height={64}
                    className="rounded-md"
                  />
                </Link>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Reset your password
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Enter your new password below.
              </p>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        New Password
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                            placeholder="Enter new password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                            placeholder="Confirm new password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-black transition-colors mt-2.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Background Image - Positioned to be half-shown/half-hidden */}
        <div className="absolute top-0 right-0 h-full w-7/10 overflow-hidden hidden lg:block">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/4 border-[10px] border-gray-400 dark:border-gray-800 rounded-2xl">
            <Image
              src="/images/email.jpg"
              alt="Fresh Farm Produce"
              width={1920}
              height={1080}
              className="rounded-md block dark:hidden"
              priority
            />
            <Image
              src="/images/email.jpg"
              alt="Fresh Farm Produce"
              width={1920}
              height={1080}
              className="rounded-md hidden dark:block"
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}
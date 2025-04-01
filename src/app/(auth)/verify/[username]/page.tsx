"use client";

import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Loader2, KeyRound } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";

// Form validation schema
const verifySchema = z.object({
  verifyCode: z.string().length(6, "Verification code must be 6 digits"),
});

export default function VerifyEmail({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const { username } = use(params);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      verifyCode: "",
    },
  });

  useEffect(() => {
    // Set initial countdown for resend button (10 minutes = 600 seconds)
    setTimeLeft(600);
    setResendDisabled(true);
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    setSuccess(null);
    
    try {
      // Send request to verify API
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          verifyCode: data.verifyCode,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        toast.error("Verification failed", {
          description: responseData.message || "Please try again",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Successful verification
      setSuccess("Email verified successfully! Redirecting to sign in...");
      toast.success("Email verified", {
        description: "Your account has been verified successfully!",
      });
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setSuccess(null);
    
    try {
      // Send request to resend verification code
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        toast.error("Failed to resend code", {
          description: responseData.message || "Please try again",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Successfully resent verification code
      setSuccess("Verification code has been resent to your email.");
      toast.success("Code resent", {
        description: "A new verification code has been sent to your email",
      });
      setTimeLeft(600); // Reset countdown timer
      setResendDisabled(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend code", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

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
                    src="/images/logobgr.png"
                    alt="FreshLeap"
                    width={64}
                    height={64}
                    className="rounded-md"
                  />
                </Link>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Verify Your Email
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                We&apos;ve sent a verification code to your email address.
                Please enter it below to verify your account.
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
                  name="verifyCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Verification Code
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <KeyRound className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={6}
                            className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 text-center text-xl tracking-widest"
                            placeholder="000000"
                            onChange={(e) => {
                              // Only allow digits
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              field.onChange(value);
                            }}
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
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendDisabled || isSubmitting}
                  className={`font-medium ${
                    resendDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                  }`}
                >
                  {resendDisabled
                    ? `Resend code in ${formatTime(timeLeft)}`
                    : "Resend code"}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already verified?{" "}
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
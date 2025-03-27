"use client";

import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail } from "lucide-react";
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    setSuccess(null);
    
    try {
      // Send request to forgot-password API
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        toast.error("Failed to send reset link", {
          description: responseData.message || "Please try again",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Successfully sent reset link
      setSuccess("Password reset link has been sent to your email address. Please check your inbox.");
      toast.success("Reset link sent", {
        description: "Please check your email inbox",
      });
      form.reset(); // Clear form
      setIsSubmitting(false);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Failed to send reset link", {
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
                    src="/images/logo.png"
                    alt="FreshLeap"
                    width={64}
                    height={64}
                    className="rounded-md"
                  />
                </Link>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Forgot your password?
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password.
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
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Email
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                            placeholder="Enter your email"
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
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
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
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { use } from "react";

// Form validation schema
const verifySchema = z.object({
  verifyCode: z.string().length(6, "Verification code must be 6 digits"),
});

export default function VerifyEmail({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const { username } = use(params);
  
  const [formData, setFormData] = useState({
    verifyCode: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(true);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow digits for verification code
    if (name === "verifyCode" && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setSuccess(null);
    
    // Validate form data
    try {
      verifySchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Send request to verify API
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          verifyCode: formData.verifyCode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setApiError(data.message || "Verification failed. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Successful verification
      setSuccess("Email verified successfully! Redirecting to sign in...");
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setApiError(null);
    setSuccess(null);
    setIsLoading(true);
    
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
      
      const data = await response.json();
      
      if (!response.ok) {
        setApiError(data.message || "Failed to resend verification code. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Successfully resent verification code
      setSuccess("Verification code has been resent to your email.");
      setTimeLeft(600); // Reset countdown timer
      setResendDisabled(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Resend verification error:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to your email address. Please enter it below to verify your account.
          </p>
        </div>
        
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="verifyCode" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="verifyCode"
              name="verifyCode"
              type="text"
              maxLength={6}
              required
              className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.verifyCode ? "ring-red-300" : "ring-gray-300"
              } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              placeholder="Enter 6-digit code"
              value={formData.verifyCode}
              onChange={handleChange}
            />
            {errors.verifyCode && (
              <p className="mt-1 text-sm text-red-600">{errors.verifyCode}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendDisabled || isLoading}
              className={`font-medium ${
                resendDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-500"
              }`}
            >
              {resendDisabled
                ? `Resend code in ${formatTime(timeLeft)}`
                : "Resend code"}
            </button>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already verified?{" "}
            <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
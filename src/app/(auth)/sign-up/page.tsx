"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

// Form validation schema
const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["farmer", "customer"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
  // Farmer-specific fields (required only if role is "farmer")
  farmName: z.string().optional(),
  farmLocation: z.string().optional(),
  contactNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    if (data.role === "farmer") {
      return !!data.farmName && !!data.farmLocation && !!data.contactNumber;
    }
    return true;
  },
  {
    message: "Farm details are required for farmer registration",
    path: ["role"],
  }
);

export default function SignUp() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "farmer" | "customer",
    farmName: "",
    farmLocation: "",
    contactNumber: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
    
    // Validate form data
    try {
      signUpSchema.parse(formData);
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
      // Prepare data for API
      const apiData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === "farmer" && {
          farmName: formData.farmName,
          farmLocation: formData.farmLocation,
          contactNumber: formData.contactNumber,
        }),
      };
      
      // Send request to sign-up API
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setApiError(data.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Successful registration
      router.push(`/verify/${formData.username}`);
    } catch (error) {
      console.error("Sign-up error:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.username ? "ring-red-300" : "ring-gray-300"
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.email ? "ring-red-300" : "ring-gray-300"
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.password ? "ring-red-300" : "ring-gray-300"
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.confirmPassword ? "ring-red-300" : "ring-gray-300"
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="role"
                name="role"
                required
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.role ? "ring-red-300" : "ring-gray-300"
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="farmer">Farmer</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            
            {formData.role === "farmer" && (
              <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900">Farm Details</h3>
                
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                    Farm Name
                  </label>
                  <input
                    id="farmName"
                    name="farmName"
                    type="text"
                    required={formData.role === "farmer"}
                    className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                      errors.farmName ? "ring-red-300" : "ring-gray-300"
                    } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                    value={formData.farmName}
                    onChange={handleChange}
                  />
                  {errors.farmName && (
                    <p className="mt-1 text-sm text-red-600">{errors.farmName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700">
                    Farm Location
                  </label>
                  <input
                    id="farmLocation"
                    name="farmLocation"
                    type="text"
                    required={formData.role === "farmer"}
                    className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                      errors.farmLocation ? "ring-red-300" : "ring-gray-300"
                    } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                    value={formData.farmLocation}
                    onChange={handleChange}
                  />
                  {errors.farmLocation && (
                    <p className="mt-1 text-sm text-red-600">{errors.farmLocation}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required={formData.role === "farmer"}
                    className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                      errors.contactNumber ? "ring-red-300" : "ring-gray-300"
                    } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
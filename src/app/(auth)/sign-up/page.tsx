"use client";

import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Mail, Lock, MapPin, Phone, Building } from "lucide-react";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "customer",
      farmName: "",
      farmLocation: "",
      contactNumber: "",
    },
  });

  // Get current role value for conditional rendering
  const role = form.watch("role");

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const apiData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === "farmer" && {
          farmName: data.farmName,
          farmLocation: data.farmLocation,
          contactNumber: data.contactNumber,
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
      
      const responseData = await response.json();
      
      if (!response.ok) {
        toast.error("Registration failed", {
          description: responseData.message || "Please try again",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Successful registration
      toast.success("Account created", {
        description: "Please verify your email to continue",
      });
      
      // Redirect to verification page
      router.push(`/verify/${data.username}`);
    } catch (error) {
      console.error("Sign-up error:", error);
      toast.error("Registration failed", {
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
                Join FreshLeap!
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Sign up to start your fresh food journey
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Username
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                            placeholder="Username"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

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
                            placeholder="Email address"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Password
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
                            placeholder="Password"
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
                        Confirm Password
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
                            placeholder="Confirm password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        I am a
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="farmer">Farmer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                {role === "farmer" && (
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Farm Details
                    </h3>

                    <FormField
                      name="farmName"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Farm Name
                          </FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Building className="w-5 h-5 text-green-500 dark:text-green-400" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                                placeholder="Farm name"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="farmLocation"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Farm Location
                          </FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <MapPin className="w-5 h-5 text-green-500 dark:text-green-400" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                                placeholder="Farm location"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="contactNumber"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Contact Number
                          </FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Phone className="w-5 h-5 text-green-500 dark:text-green-400" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                className="pl-10 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                                placeholder="Contact number"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-black transition-colors mt-2.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
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
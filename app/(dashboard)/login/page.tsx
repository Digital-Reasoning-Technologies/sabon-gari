"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { toast } = useToast();
  const lastToastMessageRef = useRef<string>("");
  const nextPath = searchParams.get('next') || '/admin';

  // Check for logout success message or expired token
  useEffect(() => {
    const logoutSuccess = searchParams.get('logout');
    const expired = searchParams.get('expired');
    
    if (logoutSuccess === 'success') {
      toast({
        variant: 'success',
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
      // Clean up URL
      router.replace('/login');
    } else if (expired === 'true') {
      toast({
        variant: 'destructive',
        title: 'Session expired',
        description: 'Your session has expired. Please login again.',
      });
      // Clean up URL
      router.replace('/login');
    }
  }, [searchParams, toast, router]);

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          // User is already logged in, redirect to intended path or dashboard
          router.replace(nextPath);
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    }
    checkAuth();
  }, [router, nextPath]);

  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    { ok: true, message: "" }
  );

  useEffect(() => {
    if (isPending) return;
    if (state?.ok !== false || !state?.message) return;
    if (lastToastMessageRef.current === state.message) return;

    lastToastMessageRef.current = state.message;
    toast({
      variant: "destructive",
      title: "Login failed",
      description: state.message,
    });
  }, [isPending, state?.ok, state?.message, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="relative w-24 h-24 mb-6 mx-auto">
            <Image
              src="/logo.png" // Update this path to your logo
              alt="Kudan Logo"
              fill
              className="object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-300 hover:scale-105"
              priority
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-green-800 mb-2">Welcome Back Admin!</h1>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-1 bg-green-600 mx-auto"
          ></motion.div>
          <p className="text-gray-600 mt-4">Sign in to your account</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="shadow-xl border-green-100">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-6">
                {/* Hidden field to preserve redirect path */}
                <input type="hidden" name="next" value={nextPath} />
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-800">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-green-800">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-green-700 hover:text-green-800 font-medium">
                    Forgot password?
                  </Link>
                </div> */}

                {/* Submit Button */}
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition-colors"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
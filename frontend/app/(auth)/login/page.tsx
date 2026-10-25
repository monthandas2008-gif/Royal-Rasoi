'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Utensils, Lock, Mail, Sparkles, UserCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useStore } from '@/lib/store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fillDemoAccount = (demoEmail = 'arjun@example.com', demoPass = 'password123') => {
    setValue('email', demoEmail, { shouldValidate: true });
    setValue('password', demoPass, { shouldValidate: true });
    toast.success('Inserted Demo Customer Account: Arjun Sharma');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const token = response.data.access_token || response.data.token;
      const user = response.data.user;

      // Save token to cookies (both auth_token & token for compatibility)
      const cookieOptions = data.rememberMe
        ? { expires: 30 }
        : { expires: 7 };
      Cookies.set('auth_token', token, cookieOptions);
      Cookies.set('token', token, cookieOptions);

      // Update zustand store
      setToken(token);
      setUser(user);

      toast.success('Welcome back! Redirecting...');

      // Redirect to previous page or dashboard
      const redirectTo = searchParams.get('redirect') || '/';
      setTimeout(() => router.push(redirectTo), 800);
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex">
        {/* Left Side - Ambiance Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
            alt="Royal Rasoi Restaurant Ambiance"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A5C1A]/80 via-[#292524]/60 to-[#292524]/80" />

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-[#D4AF37] rounded-full p-2">
                <Utensils className="w-6 h-6 text-[#292524]" />
              </div>
              <span className="text-white font-['Playfair_Display'] text-2xl font-bold">
                Royal Rasoi
              </span>
            </div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-16"
            >
              <blockquote className="text-white">
                <p className="font-['Playfair_Display'] text-3xl font-semibold italic leading-relaxed mb-4">
                  "Every great meal begins with a warm welcome"
                </p>
                <footer className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">
                  — Royal Rasoi Experience
                </footer>
              </blockquote>

              {/* Decorative line */}
              <div className="mt-8 flex items-center gap-4">
                <div className="h-px bg-[#D4AF37] flex-1 opacity-50" />
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <div className="h-px bg-[#D4AF37] flex-1 opacity-50" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FAF9F0]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
              <div className="bg-[#1A5C1A] rounded-full p-2">
                <Utensils className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="font-['Playfair_Display'] text-2xl font-bold text-[#292524]">
                Royal Rasoi
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#292524] mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-sm">
                Sign in to manage your reservations and orders
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#292524] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#292524] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#1A5C1A] focus:ring-[#1A5C1A]"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#1A5C1A] hover:text-[#D4AF37] transition-colors font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-[#1A5C1A] text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-[#1A5C1A]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Quick Demo Customer Insertion Button */}
            <div className="mt-4 mb-6 p-4 rounded-2xl bg-[#FAF9F0] border border-[#D4AF37]/60 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#1A5C1A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Demo Customer Quick Access
                </span>
                <span className="text-[10px] text-stone-500 font-mono">Arjun Sharma (VIP)</span>
              </div>
              <p className="text-[11px] text-stone-600 mb-3">
                One-click fill demo customer profile with past bookings, favorites & live reservation data.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('arjun@example.com', 'password123')}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#1A5C1A]" />
                  Fill Credentials
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'arjun@example.com', { shouldValidate: true });
                    setValue('password', 'password123', { shouldValidate: true });
                    onSubmit({ email: 'arjun@example.com', password: 'password123' });
                  }}
                  className="py-2 px-3 rounded-xl bg-[#1A5C1A] hover:bg-[#154a15] text-[#FAF9F0] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Instant Sign In
                </button>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600">
              New to Royal Rasoi?{' '}
              <Link
                href="/register"
                className="text-[#1A5C1A] hover:text-[#D4AF37] font-semibold transition-colors"
              >
                Register here
              </Link>
            </p>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back to Royal Rasoi
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F0] flex items-center justify-center text-stone-500">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

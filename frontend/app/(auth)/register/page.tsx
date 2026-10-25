'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Utensils, Lock, Mail, User, Phone } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useStore } from '@/lib/store';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(
        /^(\+91[\s-]?)?[6-9]\d{9}$/,
        'Enter a valid Indian phone number (e.g. +91 98765 43210)'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone.replace(/[\s-]/g, ''),
        password: data.password,
      });

      const token = response.data.access_token || response.data.token;
      const user = response.data.user;

      // Auto-login after registration
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('token', token, { expires: 7 });
      setToken(token);
      setUser(user);

      toast.success('Account created! Welcome to Royal Rasoi!');
      setTimeout(() => router.push('/'), 800);
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Registration failed. Please try again.';
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A5C1A]/80 via-[#292524]/60 to-[#292524]/80" />

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div className="flex items-center gap-3">
              <div className="bg-[#D4AF37] rounded-full p-2">
                <Utensils className="w-6 h-6 text-[#292524]" />
              </div>
              <span className="text-white font-['Playfair_Display'] text-2xl font-bold">
                Royal Rasoi
              </span>
            </div>

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
              <div className="mt-8 flex items-center gap-4">
                <div className="h-px bg-[#D4AF37] flex-1 opacity-50" />
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <div className="h-px bg-[#D4AF37] flex-1 opacity-50" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-[#FAF9F0] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md py-4 sm:py-6"
          >
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2 mb-4 justify-center">
              <div className="bg-[#1A5C1A] rounded-full p-1.5">
                <Utensils className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="font-['Playfair_Display'] text-xl font-bold text-[#292524]">
                Royal Rasoi
              </span>
            </div>

            <div className="mb-5 text-center lg:text-left">
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#292524] mb-1">
                Create Your Account
              </h1>
              <p className="text-gray-500 text-xs">
                Unlock VIP table reservations & pre-orders at Royal Rasoi Boisar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#292524] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Raj Mehta"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                  />
                </div>
                {errors.name && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#292524] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                  />
                </div>
                {errors.email && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#292524] mb-1">
                  Phone Number (Indian Mobile)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Passwords in 2 columns on tablet/desktop to save vertical space */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#292524] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 chars"
                      className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-0.5 text-[11px] text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#292524] mb-1">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-all text-[#292524] placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-0.5 text-[11px] text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    {...register('terms')}
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1A5C1A] focus:ring-[#1A5C1A]"
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                    I agree to the Terms of Service & Privacy Policy
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.terms.message}</p>
                )}
              </div>

              {/* Register Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-[#1A5C1A] text-white py-2.5 rounded-lg font-semibold text-sm tracking-wide hover:bg-[#1A5C1A]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#1A5C1A] hover:text-[#D4AF37] font-semibold transition-colors"
              >
                Login here
              </Link>
            </p>

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

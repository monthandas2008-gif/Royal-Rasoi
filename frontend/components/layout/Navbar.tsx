'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Crown,
  LogOut,
  ChevronDown,
  Phone,
  CalendarCheck,
  CalendarDays
} from 'lucide-react';
import { useStore } from '@/lib/store';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// ─── Nav Links Config (3D floor plan moved inside booking process) ─────────────
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/book', label: 'Book a Table' },
  { href: '/seating', label: 'Seating Floor' },
  { href: '/bookings', label: 'My Bookings' },
  { href: '/waiting-list', label: 'Priority Waitlist' },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, cart, setUser, setToken, clearCart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile menu on route change ─────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  // ── Logout handler ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('token');
    setUser(null);
    setToken(null);
    clearCart();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isHome = pathname === '/';
  
  // If on landing page and user is not logged in, hide navbar completely
  if (isHome && !user) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#FAF9F0] border-b border-[#E7E5E4] shadow-xs ${
          scrolled ? 'shadow-md backdrop-blur-md bg-[#FAF9F0]/95' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* ── Logo ────────────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#1A5C1A] flex items-center justify-center text-[#D4AF37] shadow-sm group-hover:scale-105 transition-transform">
                <Crown size={20} strokeWidth={2} />
              </div>
              <div>
                <span className="font-serif text-xl lg:text-2xl font-bold text-[#1C1917] leading-none tracking-wide flex items-center gap-1.5">
                  Royal <span className="text-[#926017]">Rasoi</span>
                </span>
                <p className="text-[10px] lg:text-xs font-sans tracking-widest leading-none mt-1 text-[#292524]/75 font-semibold">
                  Fine Indian Dining • Boisar
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav Links (High Contrast, No Text Overlap) ────────── */}
            <div className="hidden lg:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg group ${
                      active
                        ? 'text-[#1A5C1A] bg-[#1A5C1A]/10'
                        : 'text-[#292524] hover:text-[#1A5C1A] hover:bg-[#F5F3E4]'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#1A5C1A] rounded-full origin-left transition-transform duration-200 ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* ── Desktop Actions ──────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full text-[#292524] hover:bg-[#F5F3E4] hover:text-[#1A5C1A] transition-colors duration-200 border border-stone-200"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-[#1A5C1A] text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center px-0.5 shadow-sm"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* User Profile / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 border border-[#D4AF37]/50 text-[#292524] bg-white hover:bg-[#F5F3E4] shadow-xs"
                    aria-haspopup="true"
                    aria-expanded={profileMenuOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1A5C1A] text-[#FAF9F0] text-xs font-bold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown
                      size={14}
                      className={`text-stone-500 transition-transform duration-200 ${
                        profileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-[#FAF9F0] rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 bg-[#F5F3E4] border-b border-stone-200">
                          <p className="text-xs uppercase tracking-wider font-bold text-[#926017]">Royal Member</p>
                          <p className="text-sm font-bold text-[#292524] mt-0.5">{user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1.5">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#292524] hover:bg-[#EAE7D6] hover:text-[#1A5C1A] transition-colors"
                          >
                            <User size={16} className="text-[#1A5C1A]" />
                            My Profile
                          </Link>
                          <Link
                            href="/bookings"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#292524] hover:bg-[#EAE7D6] hover:text-[#1A5C1A] transition-colors"
                          >
                            <CalendarDays size={16} className="text-[#926017]" />
                            My Bookings & Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#D4AF37] text-[#292524] hover:bg-[#B8941F] transition-colors duration-200 shadow-sm"
                >
                  <User size={15} />
                  Login
                </Link>
              )}
            </div>

            {/* ── Mobile: Cart + Hamburger ─────────────────────────────── */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/cart"
                className="relative p-2 rounded-full text-[#292524] hover:bg-[#F5F3E4]"
                aria-label="Cart"
              >
                <ShoppingCart size={22} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1A5C1A] text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-md text-[#292524] hover:bg-[#F5F3E4]"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu Dropdown ─────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-[#FAF9F0] border-t border-[#E7E5E4] px-4 pt-2 pb-6 space-y-2 shadow-lg"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'bg-[#1A5C1A] text-white'
                      : 'text-[#292524] hover:bg-[#F5F3E4]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-[#E7E5E4] flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-3 py-1 text-xs text-stone-500 font-medium">
                      Signed in as <span className="font-bold text-stone-800">{user.name}</span>
                    </div>
                    <Link
                      href="/bookings"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-[#292524] hover:bg-[#F5F3E4]"
                    >
                      <CalendarDays size={16} /> My Bookings
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-[#292524] hover:bg-[#F5F3E4]"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold bg-[#D4AF37] text-[#292524]"
                  >
                    <User size={16} /> Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop for profile dropdown */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

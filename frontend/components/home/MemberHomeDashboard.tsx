'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Crown, Calendar, Clock, Sparkles, ChefHat, MapPin, Phone, 
  Star, ChevronRight, ArrowRight, ShieldCheck, Heart, Coffee, 
  UtensilsCrossed, Wine, PartyPopper, Flame, Compass, BellRing
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';

export default function MemberHomeDashboard() {
  const { user } = useStore();

  const QUICK_ACTIONS = [
    {
      title: 'Book Premium Table',
      desc: 'Pick your preferred zone in live interactive seating',
      href: '/book',
      badge: 'Guaranteed Hold',
      icon: Calendar,
      color: 'bg-emerald-800 text-emerald-100',
      action: 'Reserve Now'
    },
    {
      title: 'Explore Seating Map',
      desc: 'Check live booth, terrace deck & bar table positions',
      href: '/seating',
      badge: 'Live Floor Plan',
      icon: Compass,
      color: 'bg-[#926017] text-amber-100',
      action: 'Open Map'
    },
    {
      title: 'Pre-Order Kitchen Specialties',
      desc: 'Have authentic dum biryani & kebabs ready upon seating',
      href: '/menu',
      badge: 'Zero-Wait Kitchen',
      icon: UtensilsCrossed,
      color: 'bg-stone-800 text-stone-100',
      action: 'Order Dishes'
    },
    {
      title: 'Smart Queue Ticket',
      desc: 'Join the priority waiting list with 15-min claim window',
      href: '/waiting-list',
      badge: 'Virtual Queue',
      icon: BellRing,
      color: 'bg-blue-900 text-blue-100',
      action: 'View Queue'
    }
  ];

  const SIGNATURE_CHEF_HIGHLIGHTS = [
    {
      name: 'Nawabi Charcoal Handi Biryani',
      category: 'Slow-Cooked Dum',
      time: 'Serves 2-3 Persons',
      spice: 'Medium Spicy',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&auto=format&fit=crop&q=80',
      desc: 'Infused with royal Kashmiri saffron, crispy caramelized onions and aged Basmati.'
    },
    {
      name: 'Charcoal Smoked Butter Chicken',
      category: 'Makhani Heritage',
      time: 'Chef Recommendation',
      spice: 'Mild Velvety',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
      desc: 'Clay oven charred chicken steeped in velvet tomato gravy with churned butter and kasoori methi.'
    },
    {
      name: 'Pistachio Kulfi Falooda Royale',
      category: 'Dessert Masterpiece',
      time: 'Chilled Sweet Finale',
      spice: 'Saffron & Rose',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
      desc: 'Thick condensed milk kulfi paired with rose vermicelli and delicate tukmaria basil seeds.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F0] text-[#292524] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-[#D4AF37]/30">
      
      {/* ── MEMBER HERO GREETING BANNER ─────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172e17] via-[#1A5C1A] to-[#0d2e0d] text-[#FAF9F0] p-8 sm:p-12 shadow-2xl border border-[#D4AF37]/40 mb-12"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FAEEC5] text-xs font-semibold tracking-wider uppercase">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              Royal Rasoi Member Lounge • Boisar
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF9F0] leading-tight">
              Welcome Back, <span className="text-[#FAEEC5]">{user?.name ? user.name.split(' ')[0] : 'Guest'}</span>
            </h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-2xl font-light">
              Your royal dining table awaits. Choose your favorite ambiance, pre-order handcrafted delicacies, or check table availability in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/book" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8941F] text-[#1C1917] font-bold shadow-lg transition-transform hover:scale-105">
                Instant Reservation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/menu" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-black/30 text-white border-white/30 hover:bg-black/50 backdrop-blur-md">
                Pre-Order Food
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── QUICK ACTION TILES ─────────────────────────────────────────── */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8941F]">
              Seamless Dining Services
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#292524] mt-0.5">
              What Would You Like To Do?
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Kitchen Active in Boisar
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_ACTIONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Link href={item.href} className="block h-full">
                  <div className="bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <Badge variant="gold" className="text-[10px] tracking-wide">
                          {item.badge}
                        </Badge>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#1A5C1A] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#1A5C1A]">
                      <span>{item.action}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── LIVE DINING SESSIONS & TIME SLOTS TODAY ─────────────────────── */}
      <div className="bg-[#FAF9F0] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 mb-14 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <Badge variant="gold" className="mb-1">Today's Availability</Badge>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">
              Available Sessions & Reservation Windows
            </h3>
          </div>
          <Link href="/seating">
            <Button size="sm" variant="secondary" className="border-[#D4AF37] text-stone-800 text-xs">
              Check Seating Floor Map
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { slot: '12:00 PM', session: 'Early Lunch', status: 'Available' },
            { slot: '01:30 PM', session: 'Prime Lunch', status: 'Filling Fast' },
            { slot: '07:30 PM', session: 'Royal Evening', status: 'Available' },
            { slot: '09:00 PM', session: 'Late Feast', status: 'Available' },
          ].map((t) => (
            <Link key={t.slot} href={`/book?time=${encodeURIComponent(t.slot)}`}>
              <div className="bg-white p-4 rounded-xl border border-stone-200 hover:border-[#1A5C1A] transition-all hover:shadow-md cursor-pointer text-center">
                <span className="text-base font-bold text-stone-900 block font-mono">{t.slot}</span>
                <span className="text-xs text-stone-500 mt-0.5 block">{t.session}</span>
                <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {t.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CHEF'S SIGNATURE CREATIONS ──────────────────────────────────── */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8941F]">
              Handcrafted in Clay Handis
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#292524] mt-0.5">
              Today's Chef Recommendations
            </h2>
          </div>
          <Link href="/menu" className="mt-3 sm:mt-0 text-xs font-semibold text-[#1A5C1A] hover:underline flex items-center">
            View All 22+ Authentic Dishes <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SIGNATURE_CHEF_HIGHLIGHTS.map((dish, i) => (
            <motion.div
              key={dish.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="gold" className="text-[10px] shadow-sm">
                    {dish.category}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-[#FAEEC5] font-medium">
                  {dish.spice}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#1A5C1A] transition-colors leading-snug">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    {dish.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-600">
                    {dish.time}
                  </span>
                  <Link href="/menu">
                    <Button size="sm" className="bg-[#1A5C1A] text-white text-xs px-3.5">
                      Pre-Order
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── HOSPITALITY CONCIERGE BANNER ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#292524] to-[#1C1917] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#D4AF37]/30">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="gold" className="text-[10px]">Host Desk Support</Badge>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F0]">
            Planning a Family Banquet or Birthday Celebration?
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
            Our private Royal Darbar suite accommodates up to 10 guests with bespoke flower decorations and personalized menu cards in Boisar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <a href="tel:+919876543210" className="w-full sm:w-auto">
            <Button size="md" variant="secondary" className="w-full sm:w-auto border-[#D4AF37] text-[#FAEEC5] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              Call Host (+91 98765 43210)
            </Button>
          </a>
          <Link href="/book?zone=private" className="w-full sm:w-auto">
            <Button size="md" className="w-full sm:w-auto bg-[#1A5C1A] hover:bg-[#164E16] text-white font-semibold">
              Reserve Private Suite
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

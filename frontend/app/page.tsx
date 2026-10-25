'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Clock, MapPin, Phone, Star, ChevronRight, ArrowRight,
  ShieldCheck, CheckCircle2, Flame, Utensils, BellRing, LogIn, Crown, 
  Sparkles, Award, Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import MemberHomeDashboard from '@/components/home/MemberHomeDashboard';

const FEATURED_DISHES = [
  {
    id: 1,
    name: 'Royal Butter Chicken',
    category: 'Signature Curry',
    price: 460,
    is_veg: false,
    rating: 4.9,
    description: 'Charcoal-smoked tender chicken simmered in rich makhani gravy enriched with churned butter and fenugreek.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Nawabi Paneer Tikka',
    category: 'Clay Oven Starter',
    price: 320,
    is_veg: true,
    rating: 4.8,
    description: 'Malai paneer cubes marinated with Kashmiri deghi mirch and mustard oil, roasted to smoky perfection in clay tandoor.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Dum Pukht Mutton Biryani',
    category: 'Royal Rice Feast',
    price: 580,
    is_veg: false,
    rating: 5.0,
    description: 'Fragrant aged Basmati rice layered with juicy baby goat cuts, saffron strands, and slow-cooked in a sealed clay handi.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAUKxBzZ_HndwxKHjiyyfg19T-uJ2eKuegcd6TuZnIwiXNiuZRawHWeIv5&s=10'
  },
  {
    id: 4,
    name: 'Dal Makhani Rasoi Khas',
    category: 'Slow-Cooked Lentils',
    price: 320,
    is_veg: true,
    rating: 4.9,
    description: 'Black urad lentils simmered overnight on live charcoal with farm cream and slow-roasted plum tomatoes.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  }
];

export default function HomePage() {
  const { user } = useStore();

  // If user is successfully logged in, show the Member Home Dashboard
  if (user) {
    return <MemberHomeDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F0] text-[#292524] selection:bg-[#D4AF37]/30">
      
      {/* ── LUXURY GUEST HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden">
        {/* Real architectural restaurant dining photography background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&auto=format&fit=crop&q=85"
            alt="Royal Rasoi Dining Hall Ambience"
            fill
            priority
            className="object-cover brightness-[0.34] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F0] via-black/45 to-black/85" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-6">
          {/* Authentic Restaurant Emblem with Logo Icon & Name */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-3.5 bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-[#D4AF37]/50 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-[#1A5C1A] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/60 shadow-md">
                <Crown size={22} strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <div className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wide text-white flex items-center gap-1.5 leading-none">
                  ROYAL <span className="text-[#D4AF37]">RASOI</span>
                </div>
                <div className="text-[10px] text-[#FAF9F0]/80 tracking-widest uppercase font-semibold mt-1">
                  Fine Indian Dining • Boisar
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/60 backdrop-blur-md px-4 py-1.5 rounded-full mb-6"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-[#FAEEC5] text-xs font-semibold tracking-wider uppercase">
              Now Welcoming Guests in Boisar • Lunch & Dinner Service
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#FAF9F0] leading-tight"
          >
            The Heritage of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAEEC5] via-[#D4AF37] to-[#F5DC8A]">
              Royal Indian Dining
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-lg sm:text-xl text-[#F5F5F4]/90 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Welcome to <strong className="font-semibold text-white">Royal Rasoi</strong> in Boisar. From slow-dum handi biryanis to charcoal-grilled kebabs, indulge in authentic culinary excellence with guaranteed table reservations.
          </motion.p>

          {/* Guest Action Call-To-Action (Sign in required for booking) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8941F] text-[#1C1917] font-bold shadow-xl flex items-center gap-2 px-8">
                <LogIn className="w-4 h-4" />
                Sign In to Book a Table
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-black/45 text-[#FAEEC5] border-[#D4AF37]/80 hover:bg-black/65 backdrop-blur-md px-8">
                Create Patron Account
              </Button>
            </Link>
          </motion.div>

          {/* Restaurant Trust Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-stone-800/40">
            <div className="flex items-center justify-center gap-2 bg-stone-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 shadow-lg">
              <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="text-[#FAF9F0] font-bold text-xs sm:text-sm drop-shadow-xs">Lunch (12:00 PM – 03:30 PM) & Dinner (07:00 PM – 11:30 PM)</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-stone-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 shadow-lg">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="text-[#FAF9F0] font-bold text-xs sm:text-sm drop-shadow-xs">Shivaji Nagar Main Road, Boisar</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-stone-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 shadow-lg">
              <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="text-[#FAF9F0] font-bold text-xs sm:text-sm font-mono drop-shadow-xs">+91 98765 43210</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-stone-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 shadow-lg">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
              <span className="text-[#FAF9F0] font-bold text-xs sm:text-sm drop-shadow-xs">4.9 / 5 Guest Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOSPITALITY EXPERIENCES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <Badge variant="gold" className="mb-3">Hospitality Excellence</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#292524]">
            Thoughtfully Crafted for Your Dining Comfort
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Every detail is designed to give you and your family a seamless, relaxed dining experience in Boisar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-[#E7E5E4] hover:border-[#D4AF37]/70 transition-all h-full flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF9F0] border border-[#D4AF37]/30 flex items-center justify-center text-[#1A5C1A] mb-5">
                  <Crown className="w-6 h-6 text-[#926017]" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Interactive Table Selection</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Select your exact table before arrival. View plush corner booths, elevated open-air terrace seating, or private dining suites with clear capacity indicators.
                </p>
              </div>
              <Link href="/login?redirect=/book" className="text-[#1A5C1A] text-sm font-semibold hover:underline inline-flex items-center">
                Sign In to Reserve <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-[#E7E5E4] hover:border-[#D4AF37]/70 transition-all h-full flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF9F0] border border-[#D4AF37]/30 flex items-center justify-center text-[#1A5C1A] mb-5">
                  <BellRing className="w-6 h-6 text-[#926017]" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Virtual Queue & 15-Min Hold</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  If the dining room is occupied, join our priority virtual waiting list. Stroll nearby Boisar shops freely while we prepare your table with a guaranteed claim window.
                </p>
              </div>
              <Link href="/login?redirect=/waiting-list" className="text-[#1A5C1A] text-sm font-semibold hover:underline inline-flex items-center">
                Sign In for Waitlist <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-[#E7E5E4] hover:border-[#D4AF37]/70 transition-all h-full flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF9F0] border border-[#D4AF37]/30 flex items-center justify-center text-[#1A5C1A] mb-5">
                  <Utensils className="w-6 h-6 text-[#926017]" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Fresh Kitchen Pre-Orders</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Pre-select your favorite dum biryanis and tandoori naans. Our chefs coordinate charcoal cooking to serve your feast freshly cooked the moment your party is seated.
                </p>
              </div>
              <Link href="/login?redirect=/menu" className="text-[#1A5C1A] text-sm font-semibold hover:underline inline-flex items-center">
                Sign In to View Menu <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── SIGNATURE DISHES SHOWCASE ────────────────────────────────────── */}
      <section className="py-20 bg-[#F5F3E4]/60 border-y border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="gold" className="mb-2">Culinary Artistry</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#292524]">
                Chef's Masterpieces
              </h2>
              <p className="mt-2 text-stone-600 text-sm">
                Authentic Nawabi spices, cold-pressed mustard oil, and pure desi ghee preparations in Boisar.
              </p>
            </div>
            <Link href="/login?redirect=/menu" className="mt-4 md:mt-0">
              <Button variant="ghost" className="text-[#1A5C1A] font-bold text-sm">
                Sign in to view full menu →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_DISHES.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant={dish.is_veg ? 'veg' : 'non-veg'}>
                        {dish.is_veg ? 'Pure Veg' : 'Non-Veg'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center text-xs text-stone-500 mb-1">
                      <span>{dish.category}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {dish.rating}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between mt-3">
                  <span className="font-mono font-bold text-base text-stone-900">₹{dish.price}</span>
                  <Link href="/login?redirect=/menu">
                    <Button size="sm" className="bg-[#1A5C1A] text-white text-xs">
                      Pre-Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL RESTAURANT AMBIENCE ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="gold" className="mb-2">Dining Architecture</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#292524] leading-tight">
              A Refined Atmosphere for Every Celebration
            </h2>
            <p className="mt-4 text-stone-600 text-sm leading-relaxed">
              Step into an ambiance crafted with warm ambient light, deep teakwood finishes, and tranquil green foliage. Whether an intimate dinner for two, a family gathering, or a corporate dinner, Royal Rasoi sets the perfect backdrop.
            </p>

            <div className="mt-8 space-y-4">
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1A5C1A] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base">The Royal Central Booths</h4>
                  <p className="text-xs text-stone-600 mt-1">Plush velvet booths with warm lighting and comfortable acoustic spacing.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#926017] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base">The Green Terrace Deck</h4>
                  <p className="text-xs text-stone-600 mt-1">Elevated wood deck surrounded by natural greenery and hanging ambient lights.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#292524] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  03
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base">The Private Dining Suite</h4>
                  <p className="text-xs text-stone-600 mt-1">Dedicated private room tailored for larger family celebrations and meetings.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Link href="/login?redirect=/book">
                <Button className="bg-[#1A5C1A] text-white">
                  Sign In to Book a Table
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
          >
            <Image
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&auto=format&fit=crop&q=80"
              alt="Royal Rasoi Dining Space"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#1C1917] text-[#FAF9F0] py-14 border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1A5C1A] flex items-center justify-center text-[#D4AF37]">
                <Crown size={18} />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-[#D4AF37]">
                ROYAL RASOI
              </span>
            </div>
            <p className="text-xs text-[#FAF9F0]/60 mt-1 uppercase tracking-widest">
              Fine Indian Dining • Boisar
            </p>
            <p className="mt-4 text-stone-400 text-sm max-w-md leading-relaxed">
              Crafting unforgettable dining moments with authentic heritage recipes, Indian hospitality, and guaranteed reservations.
            </p>
            <div className="mt-6 text-xs text-stone-400 space-y-1">
              <p>📍 Shop 12, Shivaji Nagar Main Road, Boisar, Palghar - 401501</p>
              <p>📞 Phone: +91 98765 43210 / +91 87654 32109</p>
              <p>✉️ Email: reservations@royalrasoi-boisar.com</p>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base font-semibold text-[#D4AF37] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/login?redirect=/book" className="hover:text-white transition-colors">Book a Table</Link></li>
              <li><Link href="/login?redirect=/menu" className="hover:text-white transition-colors">Menu</Link></li>
              <li><Link href="/login?redirect=/waiting-list" className="hover:text-white transition-colors">Priority Waitlist</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base font-semibold text-[#D4AF37] mb-4">Operating Hours</h4>
            <div className="text-sm text-stone-400 space-y-3">
              <div>
                <p className="text-stone-200 font-medium">Lunch Service</p>
                <p className="text-xs">12:00 PM – 03:30 PM</p>
              </div>
              <div>
                <p className="text-stone-200 font-medium">Dinner Service</p>
                <p className="text-xs">07:00 PM – 11:30 PM</p>
              </div>
              <div className="pt-2">
                <Badge variant="available">Open All 7 Days</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Royal Rasoi Boisar. All rights reserved.</p>
          <p className="text-stone-400">Fine Indian Dining in Boisar.</p>
        </div>
      </footer>
    </div>
  );
}

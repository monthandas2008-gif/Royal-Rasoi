'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Crown, Heart, 
  Calendar, Clock, ShieldCheck, Edit3, Award, 
  Coffee, Star, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useStore();

  const [name, setName] = useState(user?.name || 'Arjun Sharma');
  const [email, setEmail] = useState(user?.email || 'arjun.sharma@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98201 44521');
  const [dietary, setDietary] = useState('Non-Vegetarian (Mughlai & Biryani Aficionado)');
  const [preferredZone, setPreferredZone] = useState('Terrace Garden & Royal Central Booths');
  const [seatingPreference, setSeatingPreference] = useState('Quiet Corner, Soft Lighting, Window Seating');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Dining profile preferences updated successfully!');
  };

  const FAVORITE_DISHES = [
    {
      name: 'Royal Butter Chicken',
      category: 'Signature Gravy',
      price: 460,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
      timesOrdered: 6
    },
    {
      name: 'Hyderabadi Chicken Biryani',
      category: 'Dum Biryani',
      price: 520,
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&auto=format&fit=crop&q=80',
      timesOrdered: 4
    },
    {
      name: 'Nawabi Paneer Tikka',
      category: 'Clay Oven Starter',
      price: 320,
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
      timesOrdered: 3
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F0] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* ── PROFILE HERO CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172e17] via-[#1A5C1A] to-[#0c2b0c] text-[#FAF9F0] p-8 sm:p-10 shadow-xl border border-[#D4AF37]/40 mb-10"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-[#FAF9F0] text-[#1A5C1A] font-serif font-bold text-4xl flex items-center justify-center border-4 border-[#D4AF37] shadow-lg shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FAEEC5] text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              Royal Elite Dining Member
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {name}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> {email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> {phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Boisar, Maharashtra
              </span>
            </p>
          </div>

          <div className="bg-black/25 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="text-2xl font-bold text-[#FAEEC5]">1,450</div>
            <div className="text-[11px] text-stone-300 uppercase tracking-wider font-semibold">Royalty Reward Points</div>
            <div className="text-[10px] text-emerald-300 mt-1">Tier: Gold Patron</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info & Preferences */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dining Preferences */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Guest Dining Profile & Preferences
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Our chef and floor captain personalize your table setup based on these preferences.
                </p>
              </div>
              <Button
                size="sm"
                variant={isEditing ? 'secondary' : 'ghost'}
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs border border-stone-300"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                {isEditing ? 'Cancel' : 'Edit Info'}
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm disabled:bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm disabled:bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm disabled:bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                  Dietary Category
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm disabled:bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                  Preferred Seating Ambience
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={preferredZone}
                  onChange={(e) => setPreferredZone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm disabled:bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                  Special Dining Requests & Seating Notes
                </label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={seatingPreference}
                  onChange={(e) => setSeatingPreference(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm disabled:bg-stone-50"
                />
              </div>

              {isEditing && (
                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-[#1A5C1A] text-white">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Favorite Culinary Dishes */}
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Frequently Enjoyed Dishes
              </h2>
              <Link href="/menu" className="text-xs font-bold text-[#1A5C1A] hover:underline">
                Explore Full Menu →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {FAVORITE_DISHES.map((dish, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50 rounded-xl overflow-hidden border border-stone-200 p-3 hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-28 w-full rounded-lg bg-cover bg-center mb-2"
                    style={{ backgroundImage: `url('${dish.image}')` }}
                  />
                  <div className="font-serif font-bold text-sm text-stone-900 truncate">
                    {dish.name}
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
                    <span>₹{dish.price}</span>
                    <span className="text-[#1A5C1A] font-semibold">{dish.timesOrdered} times ordered</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Member Perks & Quick Links */}
        <div className="space-y-6">
          <Card className="p-6 bg-[#FAF9F0] border border-[#D4AF37]/50 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#926017]" />
              Patron Membership Perks
            </h3>
            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A5C1A] shrink-0 mt-0.5" />
                <span><strong>Complimentary Dessert:</strong> On birthdays and anniversary bookings.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A5C1A] shrink-0 mt-0.5" />
                <span><strong>Priority Table Allocation:</strong> Advance access to private suites and garden terrace.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A5C1A] shrink-0 mt-0.5" />
                <span><strong>Zero Cancellation Penalties:</strong> Full instant credit on 24-hr advance notices.</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h4 className="font-serif font-bold text-sm text-stone-900 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="space-y-2 text-xs font-semibold">
              <Link
                href="/bookings"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#F5F3E4] transition-colors text-stone-800"
              >
                <span>View My Reservations & Orders</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                href="/book"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#F5F3E4] transition-colors text-stone-800"
              >
                <span>Reserve a New Table</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                href="/waiting-list"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#F5F3E4] transition-colors text-stone-800"
              >
                <span>Check Priority Waiting Queue</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

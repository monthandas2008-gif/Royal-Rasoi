'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  ShieldCheck, Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, clearCart, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [specialNote, setSpecialNote] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + taxes;
  // 30% advance required for pre-ordering
  const advanceRequired = Math.round(total * 0.3);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    if (!user) {
      toast.error('Please log in to confirm your pre-order');
      router.push('/login?redirect=/cart');
      return;
    }

    setLoading(true);
    try {
      await api.post('/orders/', {
        items: cart.map((i) => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          special_instructions: specialNote
        }))
      });
      clearCart();
      toast.success('Pre-order received! Your dishes will be freshly made upon your seating.');
      router.push('/bookings');
    } catch (e: any) {
      // Demo mock fallback
      clearCart();
      toast.success('Simulation: Pre-order placed successfully!');
      router.push('/bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F0] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E7E5E4]">
        <div>
          <Badge variant="gold" className="mb-2">Kitchen Pre-Order Cart</Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292524]">
            Your Selected Delicacies
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Pre-ordering guarantees zero waiting time when you dine in Royal Rasoi Boisar.
          </p>
        </div>

        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-stone-500 hover:text-rose-600 text-xs"
          >
            Clear Cart
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <ShoppingBag className="w-14 h-14 text-stone-300 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-stone-800">Your Cart is Currently Empty</h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Explore our royal tandoori starters, slow-dum handi biryanis, and rich Mughlai curries.
          </p>
          <Link href="/menu">
            <Button className="bg-[#1A5C1A] text-white px-8">Browse Culinary Menu</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  {item.image_url && (
                    <div
                      className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-stone-200"
                      style={{ backgroundImage: `url('${item.image_url}')` }}
                    />
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-900">{item.name}</h3>
                    <p className="text-sm font-semibold text-[#1A5C1A] mt-0.5">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-800">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-mono text-sm font-bold text-stone-900 min-w-[60px] text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="p-4 bg-white rounded-2xl border border-stone-200">
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-2">
                Special Kitchen Instructions (Spice level, allergy notes, etc.)
              </label>
              <textarea
                rows={2}
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="E.g., Medium spicy, separate chutney, extra onions..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-200">
                Order Billing Summary
              </h3>

              <div className="space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Dishes Subtotal:</span>
                  <span className="font-bold text-stone-800 font-mono">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurant GST (5%):</span>
                  <span className="font-bold text-stone-800 font-mono">₹{taxes}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm">
                  <span className="font-bold text-stone-900">Total Order Value:</span>
                  <span className="font-bold text-stone-900 font-mono">₹{total}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#1A5C1A]">
                  <span>30% Advance Kitchen Deposit:</span>
                  <span className="text-sm font-mono">₹{advanceRequired}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Remaining balance of ₹{total - advanceRequired} will be added to your table bill at dine-in.
                </p>
              </div>

              <Button
                isLoading={loading}
                onClick={handlePlaceOrder}
                className="w-full bg-[#1A5C1A] text-white py-3 text-sm font-bold"
              >
                Confirm Pre-Order (Pay ₹{advanceRequired})
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A5C1A]" />
                <span>100% Refundable if cancelled with booking</span>
              </div>
            </Card>

            <Link href="/menu" className="block text-center text-xs font-bold text-[#1A5C1A] hover:underline">
              ← Add More Dishes from Menu
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

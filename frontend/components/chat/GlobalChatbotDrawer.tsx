'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Sparkles, X, Bot, User,
  Calendar, Clock, Users, CreditCard, ShieldCheck, CheckCircle2,
  RefreshCw, ChevronRight, Phone, Smartphone, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useStore } from '@/lib/store';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  bookingOffer?: {
    date: string;
    timeSlot: string;
    partySize: number;
    depositAmount: number;
  };
  tokenData?: {
    token: string;
    position: number;
    people_ahead: number;
    confirmation_chance: string;
    status: string;
    amount: number;
  };
}

export default function GlobalChatbotDrawer() {
  const { user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Direct Booking Modal / Step within Chat
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('19:00');
  const [bookingParty, setBookingParty] = useState(4);
  const [bookingName, setBookingName] = useState('Manthan Verma');
  const [bookingPhone, setBookingPhone] = useState('+91 98765 43210');
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Namaste! ✨ Welcome to Royal Rasoi 👑\nWhere exceptional flavours meet royal hospitality.\n\nI'm your personal AI Dining Concierge, here to make your dining experience effortless, elegant, and unforgettable.\n\n🍽️ Explore our menu & chef's specials\n🪑 Discover available tables in immersive 3D\n📅 Book your perfect table instantly\n🎟️ Check your reservation & priority waitlist status\n\nAlready have a waitlist token? Enter it here (e.g., #WL-12345) to check your current status.\n\n✨ Your Table. Your Taste. Your Royal Experience.\n\nHow may I assist you today?",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);

  // Auto-sync customer name and phone when user logs in
  useEffect(() => {
    if (user) {
      if (user.name) setBookingName(user.name);
      if (user.phone) setBookingPhone(user.phone);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Only render chatbot if user is logged in
  if (!user) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post('/chatbot/message', {
        message: userText,
        history: historyPayload
      });

      const replyText = res.data?.reply || 'Namaste! How may I assist you with your dining experience today?';
      const tokenData = res.data?.token_data || undefined;
      const isBookingPrompt = res.data?.booking_trigger || false;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        tokenData
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If user indicated intent to book
      if (isBookingPrompt) {
        setShowBookingForm(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Namaste! Royal Rasoi me aapka swagat hai. Aap menu dishes, 3D floor plan table booking, aur priority waitlist token ke baare me kuch bhi pooch sakte hain!',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Direct Booking & Payment Execution within Chat
  const handleExecuteChatBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    try {
      await new Promise((r) => setTimeout(r, 800)); // Banking handshake simulation

      const res = await api.post('/chatbot/quick-book', {
        guest_name: bookingName,
        phone: bookingPhone,
        date_str: bookingDate,
        time_slot: bookingTime,
        party_size: bookingParty,
        special_requests: 'Booked directly via Rasoi AI Concierge',
        payment_method: bookingPaymentMethod
      });

      setShowBookingForm(false);
      const bookedData = res.data;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎉 Mubarak ho! Table successfully booked for **${bookingName}**!\n\n• **Booking Ref:** #${bookedData.booking_ref}\n• **Table:** ${bookedData.table_name}\n• **Date & Slot:** ${bookedData.date} at ${bookedData.time_slot} hrs\n• **Advance Paid:** ₹${bookedData.deposit_amount} via ${bookingPaymentMethod.toUpperCase()} (100% Secured)\n\nConfirmation message sent to ${bookingPhone}. We look forward to serving you!`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
      toast.success(`Booking #${bookedData.booking_ref} confirmed directly in chat!`);
    } catch (err: any) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#1A5C1A] to-[#123E12] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all border-2 border-[#D4AF37]"
          title="Open Royal Rasoi AI Concierge"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1A5C1A] animate-pulse" />
          </div>
          <span className="font-serif font-bold text-xs tracking-wide">
            Rasoi AI Concierge
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Slide-out Full Feature Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l-2 border-[#D4AF37] flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A5C1A] to-[#0E330E] text-white p-4 flex items-center justify-between border-b border-[#D4AF37]/40 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-stone-950 flex items-center justify-center font-bold shadow-md">
                <Bot className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base leading-tight flex items-center gap-1.5">
                  <span>Rasoi AI Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[11px] text-emerald-200">Full-Access Smart Assistant & Booking Desk</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Badges */}
          <div className="bg-[#FAF9F0] px-3.5 py-2 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-stone-700">
            <button
              type="button"
              onClick={() => {
                setShowBookingForm(true);
              }}
              className="px-2.5 py-1 rounded-full bg-[#1A5C1A] text-white hover:bg-[#144714] transition-colors shrink-0 shadow-xs flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-amber-300" /> Book a Table Here
            </button>

            <button
              type="button"
              onClick={() => {
                setInput('What are the best signature dishes at Royal Rasoi?');
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-stone-300 hover:border-stone-400 transition-colors shrink-0"
            >
              Popular Dishes
            </button>

            <button
              type="button"
              onClick={() => {
                setInput('Check my token chances for WL-');
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-stone-300 hover:border-stone-400 transition-colors shrink-0"
            >
              Check Token
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${isUser ? 'bg-stone-800 text-white' : 'bg-[#1A5C1A] text-amber-300'
                      }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] space-y-2`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${isUser
                          ? 'bg-[#1A5C1A] text-white rounded-tr-xs'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs'
                        }`}
                    >
                      {m.content}
                    </div>

                    {/* Rich Token Card inside Chat */}
                    {m.tokenData && (
                      <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span>TOKEN #{m.tokenData.token}</span>
                          <span className="bg-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                            {m.tokenData.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                          <div>Priority Position: <strong>#{m.tokenData.position}</strong></div>
                          <div>Ahead in Queue: <strong>{m.tokenData.people_ahead}</strong></div>
                          <div>Chance of Confirm: <strong className="text-emerald-700">{m.tokenData.confirmation_chance}</strong></div>
                          <div>Full Refund: <strong>100% in 15 mins</strong></div>
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] text-stone-400 block px-1">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1A5C1A]" />
                <span>Concierge is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Direct Booking Modal Inside Chat (Embedded) */}
          {showBookingForm && (
            <div className="p-4 bg-white border-t-2 border-[#D4AF37] shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1A5C1A]" />
                  Instant Direct Booking & Payment
                </h4>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteChatBooking} className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="w-full p-1.5 border border-stone-300 rounded-md bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-1.5 border border-stone-300 rounded-md bg-stone-50"
                    >
                      <option value="12:00">12:00 PM (Lunch)</option>
                      <option value="13:00">01:00 PM (Lunch)</option>
                      <option value="19:00">07:00 PM (Dinner)</option>
                      <option value="20:00">08:00 PM (Dinner)</option>
                      <option value="21:00">09:00 PM (Dinner)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Party Size</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={bookingParty}
                      onChange={(e) => setBookingParty(parseInt(e.target.value) || 1)}
                      className="w-full p-1.5 border border-stone-300 rounded-md bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Pay Mode</label>
                    <select
                      value={bookingPaymentMethod}
                      onChange={(e) => setBookingPaymentMethod(e.target.value as any)}
                      className="w-full p-1.5 border border-stone-300 rounded-md bg-stone-50"
                    >
                      <option value="upi">UPI FastPay</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Name</label>
                    <input
                      type="text"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      required
                      className="w-full p-1.5 border border-stone-300 rounded-md bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Mobile Phone</label>
                    <input
                      type="tel"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      required
                      className="w-full p-1.5 border border-stone-300 rounded-md bg-stone-50 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-2 bg-[#1A5C1A] hover:bg-[#144714] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 mt-1 shadow-sm"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Payment (₹{Math.max(300, bookingParty * 150)})...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay ₹{Math.max(300, bookingParty * 150)} & Confirm Reservation</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about dishes, book table, or check token chances..."
                className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-[#1A5C1A] text-white hover:bg-[#144714] disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

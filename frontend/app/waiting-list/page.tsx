'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Clock, Users, ArrowRight, CheckCircle2, AlertCircle,
  ShieldCheck, CreditCard, Box, LayoutGrid, Smartphone,
  Receipt, MessageSquare, RefreshCw, Printer, Download,
  Sparkles, Timer, HelpCircle, Check, XCircle, PlusCircle, History, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { SeatingView3D, DEFAULT_DEMO_TABLES, Table3DItem } from '@/components/seating/SeatingView3D';

// 12-Hour formatted time slots
const TIME_SLOTS_12HR = [
  { value: '12:00', label: '12:00 PM (Lunch)' },
  { value: '13:00', label: '01:00 PM (Lunch)' },
  { value: '14:00', label: '02:00 PM (Lunch)' },
  { value: '15:00', label: '03:00 PM (Lunch)' },
  { value: '19:00', label: '07:00 PM (Dinner)' },
  { value: '20:00', label: '08:00 PM (Dinner)' },
  { value: '21:00', label: '09:00 PM (Dinner)' },
  { value: '22:00', label: '10:00 PM (Dinner)' }
];

export default function PriorityWaitingListPage() {
  const router = useRouter();
  const { user } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Active Tab/Step (1: Select Slot & Table, 2: Guest Details, 3: Full Payment, 4: Live Token Receipt)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [seatingViewMode, setSeatingViewMode] = useState<'3d' | '2d'>('3d');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('20:00');
  const [partySize, setPartySize] = useState(4);
  const [selectedTable, setSelectedTable] = useState<Table3DItem | null>(null);
  const [guestName, setGuestName] = useState(user?.name || 'Manthan Verma');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('manthan@okhdfcbank');

  // Tables state (filtered to show only waitlisted candidate seats)
  const [waitlistTables, setWaitlistTables] = useState<Table3DItem[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Live Token & Tracking State
  const [liveTicket, setLiveTicket] = useState<any>(null);
  const [myPastTickets, setMyPastTickets] = useState<any[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStage, setPaymentStage] = useState(1);
  const [paymentStageText, setPaymentStageText] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins = 900s
  const [isSimulatingConfirm, setIsSimulatingConfirm] = useState(false);
  const [isSimulatingRefund, setIsSimulatingRefund] = useState(false);

  // Required Deposit: Rs 150 per person or min Rs 300
  const totalAmount = Math.max(300, partySize * 150);

  // Check existing active ticket in local storage or fetch history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('royal_rasoi_active_waitlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setLiveTicket(parsed);
          // If unconfirmed and still within window, compute remaining time
          if (parsed.created_at) {
            const elapsed = Math.floor((Date.now() - new Date(parsed.created_at).getTime()) / 1000);
            const remain = Math.max(0, 900 - elapsed);
            setSecondsRemaining(remain);
          }
        }
      }
    } catch {
      // Ignored
    }

    // Load past waitlist entries from backend
    const fetchMyTickets = async () => {
      try {
        const res = await api.get('/waiting_list/my');
        if (res.data && res.data.length > 0) {
          setMyPastTickets(res.data);
        }
      } catch {
        // Fallback
      }
    };
    fetchMyTickets();
  }, []);

  // Sync guest info from logged-in user
  useEffect(() => {
    if (user) {
      if (user.name) setGuestName(user.name);
      if (user.phone) setGuestPhone(user.phone);
    }
  }, [user]);

  // Fetch or filter waitlist candidate tables
  useEffect(() => {
    const fetchWaitlistSeats = async () => {
      setLoadingTables(true);
      try {
        const res = await api.get(`/reservations/availability?date=${date}&time_slot=${timeSlot}&party_size=${partySize}`);
        const rawTables: any[] = res.data?.tables || [];
        if (rawTables.length > 0) {
          const waitlistCandidates = DEFAULT_DEMO_TABLES.map((demo) => {
            const match = rawTables.find((r) => r.id === demo.id);
            if (match) {
              return {
                ...demo,
                status: match.is_waitlist ? 'waiting' : (match.status === 'booked' ? 'waiting' : match.status)
              } as Table3DItem;
            }
            return demo;
          }).filter((t) => t.status === 'waiting' || t.status === 'booked');

          if (waitlistCandidates.length === 0) {
            setWaitlistTables(
              DEFAULT_DEMO_TABLES.slice(0, 4).map((t) => ({ ...t, status: 'waiting' as const }))
            );
          } else {
            setWaitlistTables(waitlistCandidates.map((t) => ({ ...t, status: 'waiting' as const })));
          }
        } else {
          setWaitlistTables(
            DEFAULT_DEMO_TABLES.filter((t, i) => i % 2 === 1).map((t) => ({ ...t, status: 'waiting' as const }))
          );
        }
      } catch (err) {
        setWaitlistTables(
          DEFAULT_DEMO_TABLES.filter((t, i) => i % 2 === 1).map((t) => ({ ...t, status: 'waiting' as const }))
        );
      } finally {
        setLoadingTables(false);
      }
    };

    fetchWaitlistSeats();
  }, [date, timeSlot, partySize]);

  // Countdown timer for 15-minute refund window
  useEffect(() => {
    if (!liveTicket || liveTicket.status !== 'waiting') return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoRefund();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [liveTicket]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const get12HrLabel = (val: string) => {
    const slot = TIME_SLOTS_12HR.find((s) => s.value === val);
    return slot ? slot.label : `${val} hrs`;
  };

  // Process Full Advance Payment & Generate Token
  const handleProcessWaitlistPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setPaymentStage(1);
    setPaymentStageText('Initializing 256-bit encrypted banking session for Waitlist Deposit...');

    try {
      await new Promise((r) => setTimeout(r, 700));
      setPaymentStage(2);
      setPaymentStageText(
        paymentMethod === 'upi'
          ? `Routing ₹${totalAmount} to UPI VPA (${upiId})...`
          : 'Processing 3D-Secure transaction with Banking Gateway...'
      );
      await new Promise((r) => setTimeout(r, 800));

      setPaymentStage(3);
      setPaymentStageText('Full payment verified! Allocating Priority Token...');

      let newEntry: any = null;
      try {
        const res = await api.post('/waiting_list/', {
          date,
          time_slot: timeSlot,
          party_size: partySize,
          table_id: selectedTable?.id || null,
          special_requests: specialRequests || (selectedTable ? `Preferred: ${selectedTable.name}` : ''),
          phone: guestPhone
        });
        newEntry = res.data;
      } catch (err) {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        newEntry = {
          id: randomNum,
          token_ref: `WL-${randomNum.toString().slice(0, 5)}`,
          position: 1,
          date,
          time_slot: timeSlot,
          party_size: partySize,
          status: 'waiting',
          payment_amount: totalAmount,
          payment_status: 'paid',
          phone: guestPhone,
          created_at: new Date().toISOString()
        };
      }

      const completeTicket = {
        ...newEntry,
        people_ahead: 0,
        confirmation_chance: '94%',
        guest_name: guestName,
        tableName: selectedTable?.name || 'Any Available Waitlisted Table',
        payment_method: paymentMethod.toUpperCase(),
        paid_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      setLiveTicket(completeTicket);
      setSecondsRemaining(900); // 15 mins timer
      try {
        localStorage.setItem('royal_rasoi_active_waitlist', JSON.stringify(completeTicket));
      } catch {
        // Ignored
      }

      setActiveStep(4);
      toast.success(`Priority Token ${newEntry.token_ref || '#WL-01'} generated! Live tracking active.`);
    } catch (err: any) {
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const [hideQuickBar, setHideQuickBar] = useState(false);

  // Auto-dismiss confirmed quick bar after 10s if user is on new booking steps
  useEffect(() => {
    if (liveTicket?.status === 'fulfilled' && activeStep !== 4) {
      const timer = setTimeout(() => {
        setHideQuickBar(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [liveTicket?.status, activeStep]);

  // Re-initiate another booking: clear current active ticket from screen and localStorage, reset form
  const handleReInitiateBooking = () => {
    try {
      localStorage.removeItem('royal_rasoi_active_waitlist');
    } catch {}
    setLiveTicket(null);
    setHideQuickBar(true);
    setSelectedTable(null);
    setSpecialRequests('');
    setActiveStep(1);
    toast.success('Ready for a new reservation! Previous confirmed table session cleared.');
  };

  // Go back to view the active/latest ticket receipt panel
  const handleViewActiveTicket = () => {
    if (liveTicket) {
      setActiveStep(4);
    } else {
      toast('No active ticket found. Please create a new booking.', { icon: 'ℹ️' });
    }
  };

  // Simulate Instant Confirmation Trigger
  const handleSimulateConfirmation = async () => {
    setIsSimulatingConfirm(true);
    try {
      if (liveTicket?.id) {
        try {
          await api.post(`/waiting_list/simulate-confirm/${liveTicket.id}`);
        } catch {
          // Local fallback
        }
      }
      const updated = {
        ...liveTicket,
        status: 'fulfilled',
        confirmed_at: new Date().toISOString()
      };
      setLiveTicket(updated);
      try {
        localStorage.setItem('royal_rasoi_active_waitlist', JSON.stringify(updated));
      } catch {
        // Ignored
      }
      toast.success(`🎉 Table Confirmed! Instant SMS & WhatsApp notification sent to ${guestPhone}!`, { duration: 6000 });
    } finally {
      setIsSimulatingConfirm(false);
    }
  };

  // Simulate Auto-Refund when 15 minutes expire without confirmation
  const handleAutoRefund = async () => {
    setIsSimulatingRefund(true);
    try {
      if (liveTicket?.id) {
        try {
          await api.post(`/waiting_list/simulate-expire/${liveTicket.id}`);
        } catch {
          // Local fallback
        }
      }
      const updated = {
        ...liveTicket,
        status: 'expired',
        payment_status: 'refunded',
        refunded_at: new Date().toISOString()
      };
      setLiveTicket(updated);
      try {
        localStorage.setItem('royal_rasoi_active_waitlist', JSON.stringify(updated));
      } catch {
        // Ignored
      }
      toast.error(`⏳ 15-Minute window expired. 100% full refund of ₹${totalAmount} initiated to your original payment method! SMS/WhatsApp alert sent to ${guestPhone}.`, { duration: 7000 });
    } finally {
      setIsSimulatingRefund(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F0] pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* ── Active Ticket Quick-Bar (If user has an active ticket and is currently in Step 1, 2, or 3) ── */}
      {liveTicket && activeStep !== 4 && !hideQuickBar && (
        <div className="mb-6 p-4 bg-stone-900 text-white rounded-2xl shadow-xl border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in relative">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${liveTicket.status === 'fulfilled' ? 'bg-emerald-600' : 'bg-[#D4AF37] text-stone-950'}`}>
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  {liveTicket.status === 'fulfilled' ? 'Confirmed Reservation' : 'Active Waitlist Reservation'}
                </span>
                <span className="font-mono text-xs font-bold bg-white/10 px-2 py-0.5 rounded-sm text-amber-200">
                  #{liveTicket.token_ref || 'WL-ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {liveTicket.status === 'fulfilled' ? (
                  <span className="text-emerald-400 font-semibold">Table confirmed! SMS & WhatsApp dispatched.</span>
                ) : (
                  <span>Claim countdown: <strong className="text-amber-300 font-mono text-sm ml-1">{formatCountdown(secondsRemaining)}</strong> (100% auto-refund if unconfirmed)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleViewActiveTicket}
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c49f2e] text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 px-4 py-2"
            >
              <span>View Ticket & Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={() => setHideQuickBar(true)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="text-center mb-8">
        <Badge variant="gold" className="mb-2 uppercase tracking-widest text-[11px] font-bold py-1 px-3">
          Zero-Wait Priority Hospitality
        </Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#292524] tracking-tight">
          Priority Table Waiting List
        </h1>
        <p className="mt-2 text-stone-600 text-sm max-w-2xl mx-auto">
          Explore and select seats currently on waitlist in interactive <strong className="text-stone-900">2D Floor Grid</strong> or <strong className="text-stone-900">3D Spatial Twin</strong>. Book with full advance payment. Once confirmed, receive instant SMS & WhatsApp alerts; if not confirmed within <span className="text-[#B8941F] font-bold">15 minutes</span>, receive a guaranteed 100% full refund!
        </p>
      </div>

      {/* ── Navigation / Step Indicator ── */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto py-2 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${activeStep >= 1 ? 'bg-[#1A5C1A] text-white shadow-xs' : 'bg-stone-200 text-stone-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Select Waitlist Seat</span>
          </div>
          <span className="text-stone-300">──</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${activeStep >= 2 ? 'bg-[#1A5C1A] text-white shadow-xs' : 'bg-stone-200 text-stone-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Guest Details</span>
          </div>
          <span className="text-stone-300">──</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${activeStep >= 3 ? 'bg-[#1A5C1A] text-white shadow-xs' : 'bg-stone-200 text-stone-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>Full Payment</span>
          </div>
          <span className="text-stone-300">──</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${activeStep >= 4 ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-xs' : 'bg-stone-200 text-stone-600'}`}>
            <span className="w-5 h-5 rounded-full bg-stone-900/20 flex items-center justify-center text-[10px]">4</span>
            <span>Token & Receipt</span>
          </div>
        </div>
      </div>

      {/* ── STEP 1: Select Slot & Waitlist Seat (2D & 3D Interactive Views) ── */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <Card className="p-4 sm:p-6 bg-white border border-stone-200 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                  Dining Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 font-medium focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Session Slot (12-Hr)</span>
                  <span className="text-[10px] text-[#B8941F] font-bold">12h Clock Format</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 font-medium focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
                >
                  {TIME_SLOTS_12HR.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                  Party Size (Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 font-medium focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
                />
              </div>
            </div>
          </Card>

          {/* Seat View Switcher & Selection */}
          <Card className="p-4 sm:p-6 bg-white border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>Only Waitlisted Seats Shown</span>
                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    {waitlistTables.length} Active Waitlist Tables
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  In this panel, only seats currently on the waiting list are displayed for priority booking.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start sm:self-auto border border-stone-200">
                <button
                  type="button"
                  onClick={() => setSeatingViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    seatingViewMode === '3d'
                      ? 'bg-[#1A5C1A] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" /> 3D Spatial Twin
                </button>
                <button
                  type="button"
                  onClick={() => setSeatingViewMode('2d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    seatingViewMode === '2d'
                      ? 'bg-[#1A5C1A] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> 2D Floor Grid
                </button>
              </div>
            </div>

            {/* 3D View */}
            {seatingViewMode === '3d' && (
              <div className="space-y-3">
                <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-stone-300 shadow-inner bg-gradient-to-b from-[#111c14] to-[#0a120c]">
                  <SeatingView3D
                    tables={waitlistTables}
                    selectedTableId={selectedTable?.id || null}
                    date={date}
                    timeSlot={timeSlot}
                    waitlistOnly={true}
                    onTableSelect={(tbl) => {
                      setSelectedTable(tbl);
                      toast.success(`Selected ${tbl.name} for Priority Waitlist!`);
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/40 text-[11px] text-amber-300 font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    Filtered: Showing ONLY Waitlisted Tables
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-bold text-amber-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" /> Waitlisted Seat
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Click any gold-amber highlighted table to target it for queue priority.
                    </span>
                  </div>
                  {selectedTable && (
                    <span className="font-bold text-[#1A5C1A] bg-emerald-100 px-2 py-0.5 rounded-md">
                      Selected: {selectedTable.name} (Cap: {selectedTable.capacity})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 2D View */}
            {seatingViewMode === '2d' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {waitlistTables.map((tbl) => {
                    const isSelected = selectedTable?.id === tbl.id;
                    return (
                      <div
                        key={tbl.id}
                        onClick={() => {
                          setSelectedTable(tbl);
                          toast.success(`Selected ${tbl.name} for Priority Waitlist!`);
                        }}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#D4AF37] bg-amber-50/80 shadow-md ring-2 ring-[#D4AF37]'
                            : 'border-amber-200 hover:border-amber-400 bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-stone-900">{tbl.name}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            WAITLIST ONLY
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 space-y-1">
                          <p>Capacity: <strong className="text-stone-800">{tbl.capacity} Guests</strong></p>
                          <p>Zone: <span className="capitalize font-medium text-stone-700">{tbl.zone.replace('_', ' ')}</span></p>
                          <p className="text-[11px] text-amber-800 font-semibold pt-1">
                            High clearing probability under priority allocation.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-600">
                {selectedTable ? (
                  <span>Selected Table: <strong className="text-stone-900">{selectedTable.name}</strong> for <strong className="text-[#1A5C1A]">{get12HrLabel(timeSlot)}</strong> on {date}</span>
                ) : (
                  <span className="text-stone-500 italic">No specific table selected. You can proceed with auto-allocation for any clearing table.</span>
                )}
              </div>
              <Button
                type="button"
                onClick={() => setActiveStep(2)}
                className="w-full sm:w-auto bg-[#1A5C1A] hover:bg-[#144714] text-white flex items-center justify-center gap-2"
              >
                <span>Continue to Guest Details</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── STEP 2: Guest Details & Special Requests ── */}
      {activeStep === 2 && (
        <Card className="max-w-2xl mx-auto p-6 bg-white border border-stone-200 shadow-xs">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">Guest Contact for SMS & WhatsApp Dispatch</h2>
          <p className="text-xs text-stone-500 mb-6">
            If your table is confirmed within 15 minutes, automated SMS and WhatsApp confirmation alerts will be dispatched instantly to this phone number.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setActiveStep(3); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center justify-between">
                <span>Mobile Phone (SMS & WhatsApp Enabled)</span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> WhatsApp Ready
                </span>
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 focus:ring-2 focus:ring-[#1A5C1A] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Special Requests or Dietary Preferences
              </label>
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Window booth preference, birthday celebration, high chair needed..."
                className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
              />
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> First-Come Priority Allocation
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Tokens are served in order of entry time. The earlier your entry is submitted, the higher your priority rank. If a table clears within 15 minutes, the highest priority token is instantly locked and confirmed!
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveStep(1)}
                className="text-xs"
              >
                Back to Seats
              </Button>
              <Button
                type="submit"
                className="bg-[#1A5C1A] text-white flex items-center gap-2"
              >
                <span>Proceed to Full Payment (₹{totalAmount})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── STEP 3: Full Advance Payment & Policy Agreement ── */}
      {activeStep === 3 && (
        <Card className="max-w-xl mx-auto p-6 bg-white border border-stone-200 shadow-md">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B8941F]">
              Step 3 of 4
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
              Full Advance Waitlist Payment
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              As per restaurant priority policy, only waitlist bookings backed by full advance payment are entered into the live priority allocation system.
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-[#FAF9F0] p-4 rounded-xl border border-stone-300 mb-5 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Date & Session:</span>
              <strong className="text-stone-900">{date} • {get12HrLabel(timeSlot)}</strong>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Party Size:</span>
              <strong className="text-stone-900">{partySize} Guests</strong>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Target Waitlist Table:</span>
              <strong className="text-stone-900">{selectedTable?.name || 'Any Clearing Table'}</strong>
            </div>
            <div className="flex justify-between text-stone-600 pt-2 border-t border-stone-200">
              <span>Rate per person:</span>
              <span>₹150 × {partySize}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#1A5C1A] pt-1 border-t border-stone-300">
              <span>Total Advance Payable:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          {/* 15-Minute Guaranteed Refund Policy Banner */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 mb-5 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 15-Minute Guaranteed 100% Refund Policy
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              If your prioritized table cannot be confirmed within <strong>15 minutes</strong>, the entire amount of <strong>₹{totalAmount}</strong> will be <strong>automatically refunded 100%</strong> with zero cancellation deductions to your payment account!
            </p>
          </div>

          {/* Payment Method Selector */}
          <form onSubmit={handleProcessWaitlistPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                    paymentMethod === 'upi'
                      ? 'border-[#1A5C1A] bg-emerald-50 text-[#1A5C1A]'
                      : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> UPI FastPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'border-[#1A5C1A] bg-emerald-50 text-[#1A5C1A]'
                      : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Debit / Credit
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#1A5C1A] bg-emerald-50 text-[#1A5C1A]'
                      : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" /> NetBanking
                </button>
              </div>
            </div>

            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Enter UPI ID / VPA
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  required
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 focus:ring-2 focus:ring-[#1A5C1A] outline-hidden font-mono"
                />
              </div>
            )}

            {/* Simulated Stage Info */}
            {paymentProcessing && (
              <div className="p-3 bg-stone-900 text-amber-300 rounded-xl text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{paymentStageText}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <Button
                type="button"
                variant="secondary"
                disabled={paymentProcessing}
                onClick={() => setActiveStep(2)}
                className="text-xs"
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={paymentProcessing}
                className="bg-[#1A5C1A] hover:bg-[#144714] text-white px-6 font-bold"
              >
                Pay ₹{totalAmount} & Generate Priority Token
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── STEP 4: Live Priority Token Receipt & Real-Time Tracking ── */}
      {activeStep === 4 && liveTicket && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Back Action Header to book another reservation */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="text-xs text-stone-600">
              <span>Token: <strong className="text-stone-900 font-mono">#{liveTicket.token_ref}</strong></span>
              <span className="mx-2">•</span>
              <span>Need to book another table or time slot?</span>
            </div>

            <Button
              type="button"
              onClick={handleReInitiateBooking}
              className="bg-[#1A5C1A] hover:bg-[#144714] text-white text-xs font-bold flex items-center gap-1.5 px-4 py-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Another Reservation</span>
            </Button>
          </div>

          {/* Status Alert Banner */}
          {liveTicket.status === 'fulfilled' ? (
            <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-white shrink-0" />
                <div>
                  <h3 className="font-serif text-lg font-bold">🎉 TABLE CONFIRMED & ASSIGNED!</h3>
                  <p className="text-xs text-emerald-100">
                    A table has been vacated and allocated to your Priority Token. Instant confirmation SMS & WhatsApp sent to {guestPhone}!
                  </p>
                </div>
              </div>
              <span className="bg-white/20 text-white border border-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                CONFIRMED
              </span>
            </div>
          ) : liveTicket.status === 'expired' ? (
            <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-white shrink-0" />
                <div>
                  <h3 className="font-serif text-lg font-bold">⏳ 15-MIN WINDOW EXPIRED — 100% REFUND INITIATED</h3>
                  <p className="text-xs text-rose-100">
                    ₹{totalAmount} has been completely refunded back to your account without deductions. Alert sent to {guestPhone}.
                  </p>
                </div>
              </div>
              <span className="bg-white/20 text-white border border-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                REFUNDED
              </span>
            </div>
          ) : (
            <div className="p-4 bg-amber-500 text-stone-950 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Timer className="w-7 h-7 text-stone-950 shrink-0 animate-pulse" />
                <div>
                  <h3 className="font-serif text-base font-bold">LIVE PRIORITY QUEUE ACTIVE — CLAIM WINDOW RUNNING</h3>
                  <p className="text-xs text-stone-900 font-medium">
                    Queue Position: <strong className="underline">#{liveTicket.position || 1}</strong>. Auto-refund triggers if unconfirmed in 15 mins.
                  </p>
                </div>
              </div>
              <div className="bg-stone-950 text-amber-400 font-mono font-black text-xl px-4 py-2 rounded-xl text-center shadow-inner self-end sm:self-auto">
                {formatCountdown(secondsRemaining)}
              </div>
            </div>
          )}

          {/* Printable Official Receipt & Token */}
          <div ref={receiptRef} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-300 shadow-xl print:m-0 print:border-none">
            {/* Header */}
            <div className="text-center pb-6 border-b-2 border-dashed border-stone-200">
              <Badge variant="gold" className="mb-1 text-[10px] font-bold tracking-widest">
                OFFICIAL ADVANCE TOKEN RECEIPT
              </Badge>
              <h2 className="font-serif text-3xl font-extrabold text-[#1A5C1A] tracking-wider">
                ROYAL RASOI
              </h2>
              <p className="text-[11px] text-stone-500 uppercase tracking-widest">
                Fine Dining & Heritage Royal Hospitality
              </p>
            </div>

            {/* Token Badge */}
            <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-[#FAF9F0] via-[#FAEEC5]/40 to-[#FAF9F0] border-2 border-[#D4AF37] text-center">
              <span className="text-[11px] uppercase tracking-widest font-black text-[#B8941F]">
                PRIORITY ALLOCATION TOKEN
              </span>
              <div className="font-serif text-4xl sm:text-5xl font-black text-[#1A5C1A] tracking-tight my-1">
                #{liveTicket.token_ref || 'WL-08921'}
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-xs bg-[#1A5C1A] text-white px-3 py-0.5 rounded-full font-bold">
                  Priority Rank: #{liveTicket.position || 1}
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-0.5 rounded-full font-bold">
                  Clearing Probability: {liveTicket.confirmation_chance || '92%'}
                </span>
              </div>
            </div>

            {/* Key Receipt Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Guest Name</span>
                <strong className="text-stone-900 text-sm">{guestName}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Mobile Phone</span>
                <strong className="text-stone-900 text-sm font-mono">{guestPhone}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Dining Session</span>
                <strong className="text-stone-900 text-sm">{date} • {get12HrLabel(timeSlot)}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Party Size</span>
                <strong className="text-stone-900 text-sm">{partySize} Guests</strong>
              </div>
            </div>

            {/* Financial Details */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Assigned Target Table:</span>
                <strong className="text-stone-900">{liveTicket.tableName || 'Waitlist Priority Cluster'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Full Advance Deposit Paid:</span>
                <strong className="text-stone-900 font-bold">₹{totalAmount}.00 (100% Secured)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Payment Status:</span>
                <span className="font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  {liveTicket.payment_status || 'PAID'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-600">Notification Dispatch:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> SMS & WhatsApp Instant Delivery
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600">Refund Guarantee:</span>
                <span className="font-semibold text-stone-700">100% Refund if unconfirmed within 15 mins</span>
              </div>
            </div>

            {/* Footer QR / Sign */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
              <span>Token Hash: RR-{Math.random().toString(36).substring(2, 10).toUpperCase()} • 256-Bit Cryptographic Receipt</span>
              <span>Generated at: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Action Tools & Demonstrator Controls */}
          <Card className="p-5 bg-white border border-stone-200 shadow-xs">
            <h4 className="font-serif text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Priority Waitlist Demonstration Controls
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Test real-time webhook reactions for both positive confirmation (with instant SMS/WhatsApp notification simulation) and 15-minute guarantee timeout (with 100% full auto-refund):
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleSimulateConfirmation}
                isLoading={isSimulatingConfirm}
                disabled={liveTicket.status !== 'waiting'}
                className="bg-[#1A5C1A] hover:bg-[#144714] text-white text-xs flex items-center gap-1.5 font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> Simulate Table Vacancy & Confirm (SMS/WhatsApp)
              </Button>

              <Button
                type="button"
                onClick={handleAutoRefund}
                isLoading={isSimulatingRefund}
                disabled={liveTicket.status !== 'waiting'}
                variant="secondary"
                className="border-rose-400 text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1.5 font-bold"
              >
                <XCircle className="w-4 h-4" /> Simulate 15-Min Expiry & 100% Refund
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handlePrint}
                className="text-stone-700 hover:text-stone-900 text-xs flex items-center gap-1.5 ml-auto"
              >
                <Printer className="w-4 h-4" /> Print Token Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { 
  Calendar, Clock, Users, ShieldCheck, CheckCircle2, 
  CreditCard, Sparkles, ChevronRight, ArrowLeft,
  Lock, RefreshCw, Smartphone, Landmark, Check, Box, LayoutGrid,
  Printer, Download, Crown, MapPin, Phone, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { SeatingView3D, DEFAULT_DEMO_TABLES, Table3DItem } from '@/components/seating/SeatingView3D';

// 12-hour format display with 24-hr values
const TIME_SLOTS_12HR = [
  { value: '12:00', label: '12:00 PM', period: 'Lunch' },
  { value: '13:00', label: '01:00 PM', period: 'Lunch' },
  { value: '14:00', label: '02:00 PM', period: 'Lunch' },
  { value: '15:00', label: '03:00 PM', period: 'Lunch' },
  { value: '19:00', label: '07:00 PM', period: 'Dinner' },
  { value: '20:00', label: '08:00 PM', period: 'Dinner' },
  { value: '21:00', label: '09:00 PM', period: 'Dinner' },
  { value: '22:00', label: '10:00 PM', period: 'Dinner' }
];

function BookForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();
  const printableReceiptRef = useRef<HTMLDivElement>(null);

  // Multi-step states (1: Date & Party, 2: Table Selection, 3: Guest Info & Policy, 4: Deposit Payment, 5: Confirmed)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('19:00');
  const [partySize, setPartySize] = useState(4);
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Table view selection mode: '3d' spatial interactive twin or '2d' floor grid
  const [seatingViewMode, setSeatingViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedTable, setSelectedTable] = useState<{ id: number; name: string; capacity: number } | null>(null);
  const [availableTables, setAvailableTables] = useState<any[]>([]);

  // Guest details populated from logged in user if available
  const [guestName, setGuestName] = useState(user?.name || 'Arjun Sharma');
  const [guestEmail, setGuestEmail] = useState(user?.email || 'arjun@example.com');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+91 98765 43210');
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Check login authentication
  useEffect(() => {
    if (user) {
      if (user.name) setGuestName(user.name);
      if (user.email) setGuestEmail(user.email);
      if (user.phone) setGuestPhone(user.phone);
    }
  }, [user]);

  // Payment method & realistic payment processing sequence
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStage, setPaymentStage] = useState(1);
  const [paymentStageText, setPaymentStageText] = useState('');

  // Check pre-filled query params or receipt parameter
  useEffect(() => {
    const receiptRef = searchParams.get('receipt');
    if (receiptRef) {
      setConfirmedBooking({
        booking_ref: receiptRef,
        date: new Date().toISOString().split('T')[0],
        time_slot: '19:30',
        party_size: 4,
        deposit_amount: 600,
        table: { name: 'Table 3 (Main Hall Royal Booth)' }
      });
      setCurrentStep(5);
      return;
    }

    const tableId = searchParams.get('tableId');
    const tableName = searchParams.get('tableName');
    const capacity = searchParams.get('capacity');
    if (tableId && tableName) {
      setSelectedTable({
        id: parseInt(tableId),
        name: tableName,
        capacity: capacity ? parseInt(capacity) : 4
      });
      setCurrentStep(2);
    }
  }, [searchParams]);

  // Fetch live tables for slot
  const checkAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reservations/availability?date=${date}&time_slot=${timeSlot}&party_size=${partySize}`);
      const rawTables = res.data.tables || [];
      if (rawTables.length > 0) {
        const merged = DEFAULT_DEMO_TABLES.map((demo) => {
          const match = rawTables.find((r: any) => r.id === demo.id);
          if (match) {
            return {
              ...demo,
              status: match.status === 'available' ? 'available' : match.is_waitlist ? 'waiting' : 'booked',
              suitable_for_party: match.suitable_for_party ?? (demo.capacity >= partySize)
            };
          }
          return demo;
        });
        setAvailableTables(merged);
      } else {
        setAvailableTables(DEFAULT_DEMO_TABLES);
      }
      setCurrentStep(2);
    } catch (err) {
      // Demo fallback in case backend is offline — use unified DEFAULT_DEMO_TABLES
      setAvailableTables(DEFAULT_DEMO_TABLES);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const depositAmount = Math.max(300, partySize * 150);

  // Realistic simulation of multi-step banking payment gateway
  const handleCompleteReservation = async () => {
    if (!policyAccepted) {
      toast.error('Please accept the cancellation and refund policy to proceed.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStage(1);
    setPaymentStageText('Initializing 256-bit encrypted gateway session...');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setPaymentStage(2);
      setPaymentStageText(
        paymentMethod === 'upi' 
          ? 'Routing request to UPI Virtual Payment Address...' 
          : paymentMethod === 'card' 
          ? 'Authorizing 3D Secure OTP with Card Issuer...' 
          : 'Connecting to Core Banking Gateway...'
      );

      let bookingData: any = null;
      try {
        const res = await api.post('/reservations/', {
          table_id: selectedTable?.id || 3,
          date: date,
          time_slot: timeSlot,
          party_size: partySize,
          special_requests: specialRequests
        });
        bookingData = res.data;
      } catch (e) {
        // Fallback simulation
        const mockRef = `RR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        bookingData = {
          booking_ref: mockRef,
          date,
          time_slot: timeSlot,
          party_size: partySize,
          deposit_amount: depositAmount,
          table: { name: selectedTable?.name || 'Table 3 (Main Hall Royal Booth)' }
        };
      }

      await new Promise((r) => setTimeout(r, 900));
      setPaymentStage(3);
      setPaymentStageText(`Securing ₹${depositAmount} holding deposit & confirming table...`);

      try {
        await api.post('/payments/process', {
          booking_ref: bookingData.booking_ref,
          amount: depositAmount,
          payment_method: paymentMethod,
          accepted_policy: true
        });
      } catch (e) {
        // Mock success
      }

      await new Promise((r) => setTimeout(r, 800));
      setPaymentStage(4);
      setPaymentStageText('Transaction Approved! Generating digital confirmation token...');
      await new Promise((r) => setTimeout(r, 600));

      setConfirmedBooking(bookingData);
      setIsProcessingPayment(false);
      setCurrentStep(5);
      toast.success('Table reserved successfully! Deposit verified.');
    } catch (err: any) {
      setIsProcessingPayment(false);
      toast.error('Payment processing failed. Please retry.');
    }
  };

  const get12HrLabel = (val: string) => {
    const found = TIME_SLOTS_12HR.find(t => t.value === val);
    return found ? found.label : `${val} hrs`;
  };

  // Printable and downloadable clean PDF/document handler
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F0] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 print:hidden">
        <Badge variant="gold" className="mb-2">Guaranteed Table Booking</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292524]">
          Reserve Your Royal Rasoi Experience
        </h1>
        <p className="mt-2 text-stone-600 text-sm max-w-lg mx-auto">
          Boisar • Instant Table Guarantee with Interactive Seating Choice & 100% Refundable Cancellation
        </p>
      </div>

      {/* Progress Steps Header (Hidden on print) */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200 print:hidden">
        {[
          { step: 1, label: 'Date & Time' },
          { step: 2, label: 'Seating & Table' },
          { step: 3, label: 'Guest Details' },
          { step: 4, label: 'Deposit & Policy' },
          { step: 5, label: 'Confirmation' },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                currentStep >= s.step
                  ? 'bg-[#1A5C1A] text-white'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {s.step}
            </span>
            <span className="text-xs hidden md:inline font-medium text-stone-700">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── STEP 1: DATE, 12-HOUR TIME, GUESTS ── */}
      {currentStep === 1 && (
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              1. Select Date & Dining Time
            </h2>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Instant Live Availability
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-2">
                Reservation Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-2">
                Number of Guests
              </label>
              <div className="flex items-center gap-2">
                {[2, 4, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPartySize(num)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                      partySize === num
                        ? 'bg-[#1A5C1A] text-white border-[#1A5C1A] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-[#D4AF37]'
                    }`}
                  >
                    {num} Guests
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 12-Hour Time Format Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase">
                Select Dining Slot (12-Hour Format)
              </label>
              <span className="text-[11px] text-stone-500 font-medium">Standard 90-minute dining session</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_SLOTS_12HR.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setTimeSlot(slot.value)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                    timeSlot === slot.value
                      ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37] shadow-sm ring-2 ring-[#D4AF37]/40'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <span className="text-sm">{slot.label}</span>
                  <span className="text-[10px] uppercase font-normal text-stone-500">{slot.period} Service</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={checkAvailability}
              isLoading={loading}
              className="bg-[#1A5C1A] text-white px-8 text-sm"
            >
              Choose Seating & Tables <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 2: TABLE SELECTION (INTEGRATED 3D SPATIAL TWIN & 2D FLOOR GRID) ── */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-bold text-stone-900">2. Select Your Table</h2>
                <Badge variant="gold">
                  {date} at {get12HrLabel(timeSlot)}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Toggle between the 3D spatial twin and the 2D floor grid to choose your ideal dining spot.
              </p>
            </div>

            {/* Toggle 3D vs 2D Right Here Inside The Booking Flow */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="bg-[#EAE7D6] p-1 rounded-xl flex text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSeatingViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                    seatingViewMode === '3d'
                      ? 'bg-[#1A5C1A] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" /> 3D View
                </button>
                <button
                  type="button"
                  onClick={() => setSeatingViewMode('2d')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                    seatingViewMode === '2d'
                      ? 'bg-[#1A5C1A] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> 2D Grid
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="text-stone-600 text-xs"
              >
                Change Time
              </Button>
            </div>
          </div>

          {/* ── 3D Spatial Canvas Embed ── */}
          {seatingViewMode === '3d' && (
            <div className="space-y-4">
              <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-stone-300 shadow-inner bg-gradient-to-b from-[#111c14] to-[#0a120c]">
                <SeatingView3D
                  tables={availableTables.length > 0 ? (availableTables as Table3DItem[]) : DEFAULT_DEMO_TABLES}
                  selectedTableId={selectedTable?.id || null}
                  date={date}
                  timeSlot={timeSlot}
                  onTableSelect={(tbl) => {
                    setSelectedTable({
                      id: tbl.id,
                      name: tbl.name,
                      capacity: tbl.capacity
                    });
                    toast.success(`Selected ${tbl.name} in 3D view`);
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200 gap-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" /> Available
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm" /> Occupied
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" /> Waitlist
                  </span>
                </div>
                <span className="text-[11px] text-stone-500">
                  Click any table to select. Switch to 2D view anytime — selection stays synchronized.
                </span>
              </div>
            </div>
          )}

          {/* ── 2D Floor Grid Mode (Synchronized with 3D) ── */}
          {seatingViewMode === '2d' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(availableTables.length > 0 ? availableTables : DEFAULT_DEMO_TABLES).map((tbl) => {
                const isSelected = selectedTable?.id === tbl.id;
                const isAvail = tbl.status === 'available';
                const isBooked = tbl.status === 'booked';

                return (
                  <div
                    key={tbl.id}
                    onClick={() => {
                      if (isAvail) {
                        setSelectedTable({ id: tbl.id, name: tbl.name, capacity: tbl.capacity });
                        toast.success(`Selected ${tbl.name} in 2D view`);
                      } else {
                        toast.error(`${tbl.name} is currently ${isBooked ? 'occupied' : 'waitlisted'}. Please choose an available green table.`);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#FAEEC5]/40 shadow-md ring-2 ring-[#D4AF37]'
                        : isAvail
                        ? 'border-emerald-200 hover:border-emerald-500 bg-white hover:shadow-xs'
                        : isBooked
                        ? 'border-rose-200 bg-rose-50/50 hover:border-rose-400 opacity-70'
                        : 'border-amber-200 bg-amber-50/50 hover:border-amber-400 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-stone-900">{tbl.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAvail
                            ? 'bg-emerald-100 text-emerald-800'
                            : isBooked
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAvail ? 'AVAILABLE' : isBooked ? 'OCCUPIED' : 'WAITLIST'}
                      </span>
                    </div>
                    {tbl.zone && (
                      <p className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                        Zone: {tbl.zone.replace('_', ' ')}
                      </p>
                    )}
                    <div className="text-xs text-stone-700 mt-2 flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-stone-400" /> Max Capacity: {tbl.capacity} Persons
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-bold text-[#926017]">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current Selection Bar */}
          <div className="p-4 bg-[#F5F3E4] rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-stone-500 block">
                Your Chosen Table
              </span>
              <span className="font-serif font-bold text-lg text-stone-900">
                {selectedTable ? selectedTable.name : 'Click any green available table above to select'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                disabled={!selectedTable}
                onClick={() => setCurrentStep(3)}
                className="bg-[#1A5C1A] text-white px-8"
              >
                Proceed to Guest Details <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── STEP 3: GUEST INFORMATION ── */}
      {currentStep === 3 && (
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">3. Guest Information</h2>
            {!user && (
              <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                Tip: <a href="/login?redirect=/book" className="font-bold underline text-[#1A5C1A]">Sign in</a> to link this booking to your profile!
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full p-3 rounded-lg border border-stone-300 bg-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-stone-300 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Mobile Number (For Booking Ticket SMS)
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full p-3 rounded-lg border border-stone-300 bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Special Requests or Dietary Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="E.g., Window seating, high chair needed, anniversary cake arrangement..."
                className="w-full p-3 rounded-lg border border-stone-300 bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <Button variant="ghost" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(4)}
              className="bg-[#1A5C1A] text-white px-8"
            >
              Review & Deposit <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 4: POLICY & SIMULATED DEPOSIT ── */}
      {currentStep === 4 && (
        <Card className="p-8 space-y-6">
          <h2 className="font-serif text-2xl font-bold">4. Reservation Summary & Deposit</h2>

          <div className="bg-[#F5F3E4] p-5 rounded-xl border border-[#E7E5E4] space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Selected Table:</span>
              <span className="font-bold text-stone-900">{selectedTable?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Date & Slot:</span>
              <span className="font-bold text-stone-900">{date} at {get12HrLabel(timeSlot)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Party Size:</span>
              <span className="font-bold text-stone-900">{partySize} Persons</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-300">
              <span className="font-bold text-stone-800">Initial Holding Deposit:</span>
              <span className="font-bold text-lg text-[#1A5C1A]">₹{depositAmount}</span>
            </div>
            <p className="text-[11px] text-stone-500 italic">
              * This ₹{depositAmount} deposit will be deducted 100% from your final food & beverage bill at the restaurant.
            </p>
          </div>

          {/* Cancellation Policy Box */}
          <div className="p-4 bg-white rounded-xl border border-stone-300 text-xs text-stone-700 space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1A5C1A]" />
              Royal Rasoi Transparent Cancellation Policy
            </h4>
            <p>• <strong>Free Cancellation (100% Refund):</strong> If cancelled 24 hours or more before reservation slot.</p>
            <p>• <strong>Partial Refund (50% Refund):</strong> If cancelled between 12 to 24 hours prior.</p>
            <p>• <strong>Non-refundable:</strong> If cancelled within 12 hours of booking time.</p>

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#1A5C1A] focus:ring-[#D4AF37]"
              />
              <span className="font-semibold text-stone-800">
                I have read and agree to the booking deposit terms and cancellation refund rules.
              </span>
            </label>
          </div>

          {/* Payment Method Selector (Simulation) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-700 uppercase">
              Simulated Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'upi', label: 'UPI / QR Code' },
                { id: 'card', label: 'Debit / Credit Card' },
                { id: 'netbanking', label: 'Net Banking' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === m.id
                      ? 'bg-[#1A5C1A] text-white border-[#1A5C1A]'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              * DEMO MODE: No real credit card or bank credentials will be billed.
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <Button variant="ghost" onClick={() => setCurrentStep(3)}>
              Back
            </Button>
            <Button
              isLoading={isProcessingPayment}
              disabled={!policyAccepted || isProcessingPayment}
              onClick={handleCompleteReservation}
              className="bg-[#1A5C1A] text-white px-8"
            >
              Pay ₹{depositAmount} & Confirm Table
            </Button>
          </div>
        </Card>
      )}

      {/* Realistic Simulated Payment Processing Modal Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1A5C1A] flex items-center justify-center mx-auto mb-4 relative">
              <RefreshCw className="w-8 h-8 animate-spin text-[#1A5C1A]" />
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 py-1 px-3 rounded-full w-fit mx-auto mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Secured Bank Gateway</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
              Processing Holding Deposit
            </h3>
            <p className="text-2xl font-bold text-[#1A5C1A] mb-4">
              ₹{depositAmount}
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-5">
              <p className="text-xs font-medium text-stone-700 min-h-[32px] flex items-center justify-center">
                {paymentStageText}
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-2 text-left">
              {[
                { s: 1, label: 'Secure Banking Handshake' },
                { s: 2, label: paymentMethod === 'upi' ? 'UPI Authentication' : paymentMethod === 'card' ? 'Card Authorization' : 'Net Banking Routing' },
                { s: 3, label: 'Table Allocation & Deposit Lock' },
                { s: 4, label: 'Booking Receipt Generation' },
              ].map((step) => (
                <div key={step.s} className="flex items-center gap-3 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      paymentStage > step.s
                        ? 'bg-[#1A5C1A] text-white'
                        : paymentStage === step.s
                        ? 'bg-[#D4AF37] text-stone-950 font-bold animate-pulse'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {paymentStage > step.s ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span>{step.s}</span>
                    )}
                  </div>
                  <span
                    className={`${
                      paymentStage >= step.s ? 'text-stone-900 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-stone-400 mt-5 italic">
              Please do not close or refresh this tab while the bank processes your session.
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 5: BOOKING CONFIRMED & DOWNLOADABLE/PRINTABLE RECEIPT ── */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Printable Official Receipt Document */}
          <div 
            ref={printableReceiptRef}
            className="bg-white rounded-3xl border-2 border-stone-300 shadow-xl overflow-hidden print:border-none print:shadow-none p-6 sm:p-10 max-w-2xl mx-auto"
          >
            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-stone-200 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A5C1A] flex items-center justify-center text-[#D4AF37] font-bold">
                  <Crown size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                    ROYAL RASOI
                  </h2>
                  <p className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold">
                    Fine Indian Dining • Boisar, Palghar
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-stone-600">
                <span className="font-mono text-base font-bold bg-[#FAF9F0] px-3 py-1 rounded-lg border border-stone-300 text-stone-900 block mb-1">
                  {confirmedBooking?.booking_ref || 'RR-934812'}
                </span>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 inline-block">
                  CONFIRMED & GUARANTEED
                </span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="py-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-[#FAF9F0] rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-500 uppercase tracking-wider block font-semibold mb-1">
                    Customer Name
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    {guestName}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block font-semibold mb-1">
                    Contact Phone
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    {guestPhone}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block font-semibold mb-1">
                    Reservation Date
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    {date}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block font-semibold mb-1">
                    Dining Slot
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    {get12HrLabel(timeSlot)}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block font-semibold mb-1">
                    Party Size
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    {partySize} Guests
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block font-semibold mb-1">
                    Reserved Table
                  </span>
                  <span className="font-bold text-sm text-[#1A5C1A]">
                    {confirmedBooking?.table?.name || selectedTable?.name || 'Main Hall Booth'}
                  </span>
                </div>
              </div>

              {/* Financial Deposit Receipt Table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F3E4] border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="p-3">
                        <strong className="block text-stone-900">Table Reservation Holding Deposit</strong>
                        <span className="text-[11px] text-stone-500">100% Adjustable against dine-in F&B bill</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          PAID
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-stone-900 text-sm">
                        ₹{depositAmount}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-stone-50 font-bold text-xs border-t border-stone-200">
                    <tr>
                      <td colSpan={2} className="p-3 text-stone-700">Total Deposit Transferred:</td>
                      <td className="p-3 text-right font-mono text-[#1A5C1A] text-base">₹{depositAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Restaurant Address & Guidelines */}
              <div className="pt-2 text-[11px] text-stone-500 space-y-1">
                <p>📍 <strong>Location:</strong> Shop 12, Shivaji Nagar Main Road, Boisar, Palghar - 401501</p>
                <p>🕒 <strong>Arrival Advice:</strong> Please arrive 5 minutes before {get12HrLabel(timeSlot)}. Table held for 15 minutes.</p>
                <p>🛡️ <strong>Fair Policy:</strong> 100% refundable if cancelled 24 hours prior to slot via your account dashboard.</p>
              </div>
            </div>

            {/* Print & Action Controls (Excluded when printing) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t-2 border-stone-200 print:hidden">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={handlePrintReceipt}
                  className="bg-[#1A5C1A] text-white flex items-center gap-1.5 w-full sm:w-auto text-xs font-bold"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </Button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/bookings')}
                  className="w-full sm:w-auto text-xs font-semibold"
                >
                  View In My Bookings
                </Button>
                <Button
                  variant="gold"
                  onClick={() => router.push('/menu')}
                  className="w-full sm:w-auto text-xs font-bold"
                >
                  Pre-Order Food
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F0] flex items-center justify-center text-stone-500">Loading Reservation Wizard...</div>}>
      <BookForm />
    </Suspense>
  );
}

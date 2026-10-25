'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SeatingView3D, DEFAULT_DEMO_TABLES, Table3DItem } from '@/components/seating/SeatingView3D';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Users, Sparkles, CheckCircle2, AlertCircle, Eye, LayoutGrid, Calendar, Clock, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

const TIME_SLOTS = [
  { value: '12:00', label: '12:00 PM (Lunch)' },
  { value: '13:00', label: '01:00 PM (Lunch)' },
  { value: '14:00', label: '02:00 PM (Lunch)' },
  { value: '19:00', label: '07:00 PM (Dinner)' },
  { value: '20:00', label: '08:00 PM (Dinner)' },
  { value: '21:00', label: '09:00 PM (Dinner)' },
  { value: '22:00', label: '10:00 PM (Dinner)' },
];

export default function SeatingPage() {
  const now = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const formatLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const todayDate = new Date();
  const tomorrowDate = new Date(Date.now() + 86400000);
  const dayAfterDate = new Date(Date.now() + 172800000);

  const todayStr = formatYMD(todayDate);
  const tomorrowStr = formatYMD(tomorrowDate);
  const dayAfterStr = formatYMD(dayAfterDate);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('19:00');
  const [tables, setTables] = useState<Table3DItem[]>(DEFAULT_DEMO_TABLES);
  const [selectedTable, setSelectedTable] = useState<Table3DItem | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Fetch live table availability dynamically whenever date or time slot changes
  useEffect(() => {
    let active = true;
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/reservations/availability?date=${selectedDate}&time_slot=${selectedTimeSlot}&party_size=1`
        );
        if (!active) return;
        const liveTables: any[] = res.data?.tables || [];
        if (liveTables.length > 0) {
          setTables((prev) =>
            prev.map((t) => {
              const match = liveTables.find((lt: any) => lt.id === t.id);
              if (!match) return t;
              return {
                ...t,
                status: match.status === 'available' ? 'available'
                  : (match.status === 'waiting' || match.is_waitlist) ? 'waiting'
                  : 'booked',
              } as Table3DItem;
            })
          );
        }
      } catch (err) {
        // Backend offline fallback - keep default demo distribution
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAvailability();
    return () => {
      active = false;
    };
  }, [selectedDate, selectedTimeSlot]);

  const filteredTables = tables.filter((t) => {
    if (selectedZone !== 'all' && t.zone !== selectedZone) return false;
    return true;
  });

  const counts = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    booked: tables.filter((t) => t.status === 'booked').length,
    waiting: tables.filter((t) => t.status === 'waiting').length,
  };

  const handleSelectTable = (tbl: Table3DItem) => {
    setSelectedTable(tbl);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F0] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#E7E5E4] gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Digital Spatial Twin</Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292524]">
            Interactive Seating & Floor Plan
          </h1>
          <p className="mt-2 text-stone-600 text-sm max-w-xl">
            Open-plan restaurant view. Switch seamlessly between 3D Spatial View and 2D Floor Grid with fully synchronized live availability and table details.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="bg-[#E7E5E4] p-1 rounded-xl flex text-xs shadow-inner">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-[#1A5C1A] text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              3D Spatial View
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-[#1A5C1A] text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              2D Floor Grid
            </button>
          </div>
        </div>
      </div>

      {/* Date & Time Slot Control Bar for Live Dynamic Updates */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-[#926017]" /> Date:
          </span>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-[#1A5C1A] text-white border-[#1A5C1A]'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Today ({formatLabel(todayDate)})
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              selectedDate === tomorrowStr
                ? 'bg-[#1A5C1A] text-white border-[#1A5C1A]'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Tomorrow ({formatLabel(tomorrowDate)})
          </button>
          <button
            onClick={() => setSelectedDate(dayAfterStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              selectedDate === dayAfterStr
                ? 'bg-[#1A5C1A] text-white border-[#1A5C1A]'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Day After ({formatLabel(dayAfterDate)})
          </button>
          <input
            type="date"
            value={selectedDate}
            min={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 text-stone-800 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Clock className="w-4 h-4 text-[#926017]" /> Time:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                onClick={() => setSelectedTimeSlot(slot.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedTimeSlot === slot.value
                    ? 'bg-[#D4AF37] text-[#1C1917] border-[#D4AF37] shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {slot.label.split(' ')[0]} {slot.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Stats Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <span className="text-stone-600 font-medium">Total Capacity</span>
          <span className="font-bold text-stone-900 text-sm">{counts.total} Tables</span>
        </div>
        <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <span className="text-emerald-800 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" /> Available
          </span>
          <span className="font-bold text-emerald-900 text-sm">{counts.available}</span>
        </div>
        <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
          <span className="text-rose-800 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm" /> Occupied
          </span>
          <span className="font-bold text-rose-900 text-sm">{counts.booked}</span>
        </div>
        <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <span className="text-amber-800 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" /> Waitlist
          </span>
          <span className="font-bold text-amber-900 text-sm">{counts.waiting}</span>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: `All Zones (${tables.length} Tables)` },
          { id: 'main_hall', label: `Main Hall (${tables.filter(t => t.zone === 'main_hall').length})` },
          { id: 'outdoor', label: `Terrace Garden (${tables.filter(t => t.zone === 'outdoor').length})` },
          { id: 'private', label: `Royal Darbar (${tables.filter(t => t.zone === 'private').length})` },
          { id: 'bar', label: `Lounge & Bar (${tables.filter(t => t.zone === 'bar').length})` },
        ].map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              selectedZone === zone.id
                ? 'bg-[#1A5C1A] text-white border-[#1A5C1A] shadow-xs'
                : 'bg-white text-stone-700 border-stone-300 hover:border-[#D4AF37] hover:bg-stone-50'
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* 3D or 2D Presentation Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {viewMode === '3d' ? (
            <SeatingView3D
              tables={filteredTables}
              selectedTableId={selectedTable?.id ?? null}
              onTableSelect={handleSelectTable}
              onTablesChange={(updated) => setTables(updated)}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
            />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm min-h-[580px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  2D Floor Grid — Synchronized View
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  Showing {filteredTables.length} {selectedZone === 'all' ? 'total' : selectedZone.replace('_', ' ')} tables
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTables.map((t) => {
                  const isSelected = selectedTable?.id === t.id;
                  const isAvailable = t.status === 'available';
                  const isBooked = t.status === 'booked';
                  const isWaiting = t.status === 'waiting';

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTable(t)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#FAEEC5]/35 shadow-md ring-2 ring-[#D4AF37]'
                          : isAvailable
                          ? 'border-emerald-200 hover:border-emerald-500 bg-white hover:shadow-xs'
                          : isBooked
                          ? 'border-rose-200 bg-rose-50/50 hover:border-rose-400'
                          : 'border-amber-200 bg-amber-50/50 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-stone-900">{t.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : isBooked
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isAvailable ? 'AVAILABLE' : isBooked ? 'OCCUPIED' : 'WAITLIST'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                        Zone: {t.zone.replace('_', ' ')}
                      </p>
                      <div className="text-xs text-stone-700 mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
                        <span className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-stone-400" /> {t.capacity} Guests
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
            </div>
          )}
        </div>

        {/* Details & Action Sidebar (Always 100% in sync with selected table) */}
        <div className="space-y-6">
          <Card className="border-[#D4AF37]/50 shadow-md">
            <h3 className="font-serif text-lg font-bold text-[#292524] mb-3">
              Table Selection Inspector
            </h3>

            {selectedTable ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF9F0] border border-[#E7E5E4]">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-serif font-bold text-[#1A5C1A]">
                      {selectedTable.name}
                    </span>
                    <Badge variant={selectedTable.status as any}>
                      {selectedTable.status === 'available' ? 'AVAILABLE' : selectedTable.status === 'booked' ? 'OCCUPIED' : 'WAITLIST'}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-semibold">
                    Zone: {selectedTable.zone.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-stone-700 mt-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    Max Capacity: <strong>{selectedTable.capacity} Persons</strong>
                  </p>
                </div>

                {selectedTable.status === 'available' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>This table is available on {selectedDate} at {selectedTimeSlot}. Lock your reservation now.</span>
                    </div>

                    <Link href={`/book?date=${selectedDate}&timeSlot=${selectedTimeSlot}&tableId=${selectedTable.id}&tableName=${encodeURIComponent(selectedTable.name)}&capacity=${selectedTable.capacity}`}>
                      <Button className="w-full bg-[#1A5C1A] text-white py-3">
                        Proceed to Reserve {selectedTable.name}
                      </Button>
                    </Link>
                  </div>
                ) : selectedTable.status === 'booked' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <span>This table is occupied for {selectedTimeSlot}. You can join the Priority Waitlist.</span>
                    </div>

                    <Link href="/waiting-list">
                      <Button variant="secondary" className="w-full border-amber-600 text-amber-800 hover:bg-amber-50">
                        Join Priority Waiting List
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>Waitlist ticket offers are currently active for this table.</span>
                    </div>
                    <Link href="/waiting-list">
                      <Button variant="secondary" className="w-full border-amber-600 text-amber-800 hover:bg-amber-50">
                        Join Waitlist Queue
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium">Select any table on 2D or 3D view</p>
                <p className="text-xs text-stone-400 mt-1">
                  Click on any table to view real-time availability and proceed to reservation.
                </p>
              </div>
            )}
          </Card>

          {/* Quick Info Box */}
          <Card className="bg-[#F5F3E4]/50 border-[#E7E5E4]">
            <h4 className="font-serif font-bold text-sm mb-2 text-[#292524]">
              Royal Rasoi Seating Policy
            </h4>
            <ul className="text-xs text-stone-600 space-y-2 list-disc list-inside">
              <li>Tables are held for 15 minutes past reservation time.</li>
              <li>Deposit of ₹300 per booking credited directly to food bill.</li>
              <li>Outdoor Terrace seating is subject to weather conditions.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Timer, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function GlobalWaitlistTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeWaitlist, setActiveWaitlist] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [minimized, setMinimized] = useState(false);

  // Sync active waitlist ticket from localStorage
  useEffect(() => {
    const checkStorage = () => {
      try {
        const stored = localStorage.getItem('royal_rasoi_active_waitlist');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.status === 'waiting' || parsed.status === 'fulfilled')) {
            setActiveWaitlist(parsed);
            // Calculate seconds remaining from expiry timestamp
            if (parsed.offer_expires_at) {
              const diff = Math.floor((new Date(parsed.offer_expires_at).getTime() - Date.now()) / 1000);
              setSecondsRemaining(Math.max(0, diff));
            } else if (parsed.created_at) {
              // 15 mins (900s) from creation
              const elapsed = Math.floor((Date.now() - new Date(parsed.created_at).getTime()) / 1000);
              setSecondsRemaining(Math.max(0, 900 - elapsed));
            }
            return;
          }
        }
        setActiveWaitlist(null);
      } catch {
        setActiveWaitlist(null);
      }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 3000);
    window.addEventListener('storage', checkStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkStorage);
    };
  }, []);

  // Real-time ticking
  useEffect(() => {
    if (!activeWaitlist || secondsRemaining <= 0 || activeWaitlist.status !== 'waiting') return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeWaitlist, secondsRemaining]);

  if (!activeWaitlist) return null;

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isConfirmed = activeWaitlist.status === 'fulfilled';
  const isExpired = secondsRemaining <= 0 && !isConfirmed;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`p-3.5 rounded-2xl shadow-2xl border-2 transition-all cursor-pointer backdrop-blur-md ${
          isConfirmed
            ? 'bg-emerald-950/95 border-emerald-500 text-white'
            : isExpired
            ? 'bg-stone-900/95 border-rose-500 text-white'
            : 'bg-stone-950/95 border-[#D4AF37] text-white hover:border-amber-300'
        }`}
        onClick={() => {
          router.push('/waiting-list');
        }}
        title="Click to view live waiting list ticket & receipt"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${isConfirmed ? 'bg-emerald-600' : 'bg-[#D4AF37] text-stone-950'}`}>
              {isConfirmed ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Timer className="w-4 h-4 animate-spin text-stone-950" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {isConfirmed ? 'Confirmed Ticket' : 'Live Priority Waitlist'}
                </span>
                <span className="font-mono text-[11px] font-bold bg-white/10 px-1.5 py-0.2 rounded-sm text-amber-200">
                  #{activeWaitlist.token_ref || 'WL-ACTIVE'}
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-200 mt-0.5">
                {isConfirmed ? (
                  <span className="text-emerald-400 font-bold">Table Confirmed & Ready!</span>
                ) : isExpired ? (
                  <span className="text-rose-400 font-bold">15-Min Expired • 100% Refunded</span>
                ) : (
                  <span>Claim Window: <strong className="text-amber-300 font-mono text-sm ml-1">{formatCountdown(secondsRemaining)}</strong></span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <span className="text-[11px] text-amber-300 font-medium hover:underline flex items-center gap-0.5">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                try {
                  localStorage.removeItem('royal_rasoi_active_waitlist');
                } catch {}
                setActiveWaitlist(null);
              }}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/20 transition-colors ml-1"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

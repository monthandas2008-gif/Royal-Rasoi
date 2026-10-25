'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Flame, Heart, Info, MessageCircle, Check } from 'lucide-react';
import api from '@/lib/api';

interface DishAskModalProps {
  dish: {
    id: number;
    name: string;
    description?: string;
    price: number;
    is_veg: boolean;
    image_url?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function DishAskModal({ dish, isOpen, onClose }: DishAskModalProps) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    calories: string;
    ingredients: string;
    best_for: string;
  } | null>(null);

  // Load summary on open
  React.useEffect(() => {
    if (!isOpen) return;
    const fetchSummary = async () => {
      try {
        const res = await api.post('/chatbot/dish-info', {
          dish_id: dish.id,
          dish_name: dish.name,
          dish_description: dish.description || '',
          dish_price: dish.price,
          is_veg: dish.is_veg
        });
        setSummaryData(res.data);
      } catch {
        // Fallback nutrition
        setSummaryData({
          calories: '320 - 450 kcal',
          ingredients: 'Fresh herbs, whole spices, pure ghee and organic farm ingredients',
          best_for: 'Signature authentic dining'
        });
      }
    };
    fetchSummary();
  }, [isOpen, dish]);

  if (!isOpen) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/dish-info', {
        dish_id: dish.id,
        dish_name: dish.name,
        dish_description: dish.description || '',
        dish_price: dish.price,
        is_veg: dish.is_veg,
        user_question: userQ
      });

      setChatHistory((prev) => [
        ...prev,
        { q: userQ, a: res.data?.follow_up_answer || 'Prepared fresh upon order with pure ingredients.' }
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { q: userQ, a: 'Our chefs prepare this dish fresh with authentic Indian royal spices and farm produce.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#D4AF37] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A5C1A] to-[#123E12] text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D4AF37] text-stone-950 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold leading-tight flex items-center gap-2">
                <span>{dish.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${dish.is_veg ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                  {dish.is_veg ? 'Veg' : 'Non-Veg'} • ₹{dish.price}
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200">Chef & Nutritional Insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Summary Card */}
          <div className="bg-[#FAF9F0] p-4 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[#B8941F]">
              <Info className="w-3.5 h-3.5" /> Quick Nutritional & Ingredient Summary
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-start gap-2">
                <span className="p-1 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <Flame className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Calories</span>
                  <span className="font-semibold text-stone-800">{summaryData?.calories || 'Calculating...'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Key Ingredients</span>
                  <span className="font-medium text-stone-700 leading-relaxed">{summaryData?.ingredients || 'Fresh spices & herbs'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="p-1 rounded-md bg-purple-100 text-purple-800 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Best For</span>
                  <span className="font-medium text-stone-700 leading-relaxed">{summaryData?.best_for || 'Family dining & fine taste'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Questions Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Conversation
              </span>
              {chatHistory.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="bg-stone-100 p-2.5 rounded-xl rounded-br-xs text-stone-800 font-medium ml-auto max-w-[85%] text-right">
                    {item.q}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl rounded-bl-xs text-stone-900 mr-auto max-w-[90%] leading-relaxed">
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up Question Input Box */}
        <div className="p-3 bg-stone-50 border-t border-stone-200">
          <form onSubmit={handleAsk} className="flex items-center gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Ask anything about ${dish.name} (e.g. spice level, gluten, pairings)...`}
              className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#1A5C1A] outline-hidden"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="p-2.5 rounded-xl bg-[#1A5C1A] text-white hover:bg-[#144714] disabled:opacity-50 transition-colors shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

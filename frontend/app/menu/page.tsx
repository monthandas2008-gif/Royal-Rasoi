'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ShoppingBag, Star, Flame, Sparkles, Check, ArrowRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import DishAskModal from '@/components/menu/DishAskModal';

const CATEGORIES = [
  { id: 'all', label: 'All Dishes' },
  { id: 'appetizer', label: 'Starters & Kebabs' },
  { id: 'main_course', label: 'Main Curries' },
  { id: 'biryani', label: 'Dum Biryanis' },
  { id: 'breads', label: 'Tandoori Breads' },
  { id: 'dessert', label: 'Royal Mithai' },
  { id: 'beverages', label: 'Beverages & Lassi' },
];

const AUTHENTIC_MENU_ITEMS = [
  // Appetizers
  {
    id: 1,
    name: 'Paneer Tikka',
    category: 'appetizer',
    price: 320,
    is_veg: true,
    spice_level: 'medium',
    description: 'Charcoal-skewered fresh malai paneer steeped in mustard oil, ajwain and Kashmiri deghi mirch.',
    image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Chicken Tikka',
    category: 'appetizer',
    price: 380,
    is_veg: false,
    spice_level: 'medium',
    description: 'Boneless tender chicken marinated overnight in hung spiced yogurt and slow-charred in our clay tandoor.',
    image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Hara Bhara Kebab',
    category: 'appetizer',
    price: 280,
    is_veg: true,
    spice_level: 'mild',
    description: 'Delicate spinach, green peas and roasted chana patties infused with aromatic royal spices and mint.',
    image_url: 'https://carveyourcraving.com/wp-content/uploads/2024/03/hara-bhara-kebab_.jpg'
  },
  {
    id: 4,
    name: 'Seekh Kebab',
    category: 'appetizer',
    price: 360,
    is_veg: false,
    spice_level: 'hot',
    description: 'Finely minced spiced mutton skewers scented with mint, crushed coriander seeds and smoked butter.',
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    name: 'Murgh Malai Tikka',
    category: 'appetizer',
    price: 340,
    is_veg: false,
    spice_level: 'mild',
    description: 'Velvety chicken chunks roasted in a mild marinade of heavy cream, cashew paste and green cardamom.',
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    name: 'Chicken 65',
    category: 'appetizer',
    price: 400,
    is_veg: false,
    spice_level: 'hot',
    description: 'Crisp fried chicken chunks tossed with tempered mustard seeds, fresh curry leaves and crushed fiery red chilies.',
    image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80'
  },

  // Main Course
  {
    id: 7,
    name: 'Butter Chicken',
    category: 'main_course',
    price: 460,
    is_veg: false,
    spice_level: 'mild',
    description: 'Signature charcoal roasted chicken in rich velvet tomato gravy laced with fresh churned butter and kasoori methi.',
    image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 8,
    name: 'Paneer Butter Masala',
    category: 'main_course',
    price: 380,
    is_veg: true,
    spice_level: 'mild',
    description: 'Fresh artisanal paneer cooked in a gently spiced royal cashew butter and plum tomato reduction.',
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 9,
    name: 'Dal Makhani',
    category: 'main_course',
    price: 320,
    is_veg: true,
    spice_level: 'mild',
    description: 'Whole black lentils slow cooked for 18 hours over live charcoal with churned butter and dairy cream.',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 10,
    name: 'Lamb Rogan Josh',
    category: 'main_course',
    price: 520,
    is_veg: false,
    spice_level: 'hot',
    description: 'Classic Kashmiri slow-simmered tender lamb in a rich gravy infused with dried ginger and ratan jot.',
    image_url: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400'
  },
  {
    id: 11,
    name: 'Palak Paneer',
    category: 'main_course',
    price: 360,
    is_veg: true,
    spice_level: 'mild',
    description: 'Fresh pureed spinach delicately garlic-tempered and folded with hand-pressed soft cottage cheese.',
    image_url: 'https://www.indianveggiedelight.com/wp-content/uploads/2017/10/palak-paneer-recipe-featured.jpg'
  },
  {
    id: 12,
    name: 'Chicken Kadai',
    category: 'main_course',
    price: 440,
    is_veg: false,
    spice_level: 'medium',
    description: 'Tender chicken stir-fried with crunchy bell peppers, onions and freshly pounded whole kadai spices.',
    image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80'
  },

  // Biryani
  {
    id: 13,
    name: 'Hyderabadi Chicken Biryani',
    category: 'biryani',
    price: 520,
    is_veg: false,
    spice_level: 'medium',
    description: 'Long grain aged Basmati rice layered with juicy chicken cuts, saffron threads, fried onions and slow-dum sealed.',
    image_url: 'https://www.licious.in/blog/wp-content/uploads/2022/06/chicken-hyderabadi-biryani-01.jpg'
  },
  {
    id: 14,
    name: 'Mutton Dum Biryani',
    category: 'biryani',
    price: 620,
    is_veg: false,
    spice_level: 'medium',
    description: 'Slow-cooked artisanal dum biryani prepared with bone-in tender mutton marinated in rich spices and mint.',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 15,
    name: 'Vegetable Dum Biryani',
    category: 'biryani',
    price: 420,
    is_veg: true,
    spice_level: 'mild',
    description: 'Fragrant Basmati rice cooked with fresh farm carrots, beans, peas, cottage cheese and whole spices.',
    image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80'
  },

  // Tandoori Breads
  {
    id: 16,
    name: 'Butter Naan',
    category: 'breads',
    price: 60,
    is_veg: true,
    spice_level: 'mild',
    description: 'Pillow-soft leavened flatbread charred in the clay tandoor and brushed generously with farm butter.',
    image_url: 'https://static.toiimg.com/thumb/53338316.cms?imgsize=223266&width=800&height=800'
  },
  {
    id: 17,
    name: 'Garlic Naan',
    category: 'breads',
    price: 80,
    is_veg: true,
    spice_level: 'mild',
    description: 'Fresh tandoori naan encrusted with minced roasted garlic cloves, nigella seeds and chopped coriander.',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 18,
    name: 'Laccha Paratha',
    category: 'breads',
    price: 80,
    is_veg: true,
    spice_level: 'mild',
    description: 'Multi-layered flaky whole wheat paratha glazed with pure desi ghee.',
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
  },

  // Desserts
  {
    id: 19,
    name: 'Gulab Jamun',
    category: 'dessert',
    price: 180,
    is_veg: true,
    spice_level: 'mild',
    description: 'Golden fried reduced milk spheres immersed warm in rose and green cardamom scented sugar syrup.',
    image_url: 'https://images.unsplash.com/photo-1601303516534-bf4ec6b4a19e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 20,
    name: 'Kulfi Falooda',
    category: 'dessert',
    price: 260,
    is_veg: true,
    spice_level: 'mild',
    description: 'Traditional dense pistachio kulfi served over sweet vermicelli, tukmaria seeds and rose syrup.',
    image_url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&auto=format&fit=crop&q=80'
  },

  // Beverages
  {
    id: 21,
    name: 'Kesar Mango Lassi',
    category: 'beverages',
    price: 180,
    is_veg: true,
    spice_level: 'mild',
    description: 'Thick hand-churned yogurt blended with Alphonso mango pulp, Kashmiri saffron and slivered pistachios.',
    image_url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 22,
    name: 'Masala Chaas',
    category: 'beverages',
    price: 100,
    is_veg: true,
    spice_level: 'mild',
    description: 'Refreshing spiced buttermilk whisked with roasted cumin seeds, rock salt, fresh ginger and coriander.',
    image_url: 'https://www.indianveggiedelight.com/wp-content/uploads/2023/01/masala-chaas-featured.jpg'
  }
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [menuItems, setMenuItems] = useState(AUTHENTIC_MENU_ITEMS);
  const [selectedAskDish, setSelectedAskDish] = useState<any | null>(null);
  const { cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, user } = useStore();

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await api.get('/menu/');
        if (res.data && res.data.length > 0) {
          setMenuItems(res.data);
        }
      } catch (e) {
        // Fallback initialized with verified dishes
      }
    }
    loadMenu();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (vegOnly && !item.is_veg) return false;
    return true;
  });

  const getCartQuantity = (id: number) => {
    const found = cart.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F0] pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge variant="gold" className="mb-2.5">Royal Rasoi Kitchen</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#292524] tracking-tight">
          Our Culinary Menu
        </h1>
        <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
          Prepared to order with traditional brass handis and clay tandoor in Boisar. Pre-order alongside your reservation for instant service upon arrival.
        </p>
      </div>

      {/* Filter and Veg Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E7E5E4]">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat.id
                ? 'bg-[#1A5C1A] text-white border-[#1A5C1A]'
                : 'bg-white text-stone-700 border-stone-300 hover:border-[#D4AF37]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Veg Only Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer bg-white px-3.5 py-1.5 rounded-full border border-stone-300 shrink-0">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="rounded text-green-600 focus:ring-green-500"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> Pure Veg Only
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Menu Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant={item.is_veg ? 'veg' : 'non-veg'}>
                      {item.is_veg ? 'Pure Veg' : 'Non-Veg'}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAskDish(item);
                    }}
                    className="absolute top-2.5 right-2.5 bg-stone-900/85 hover:bg-stone-900 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-transform hover:scale-105 border border-amber-400/40"
                    title={`Ask about calories, ingredients, or advice for ${item.name}`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Ask AI</span>
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedAskDish(item)}
                        className="text-[11px] font-bold text-[#1A5C1A] hover:text-[#123E12] flex items-center gap-0.5 shrink-0 underline decoration-dotted"
                      >
                        <span>Info</span>
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-base font-bold text-[#1A5C1A]">
                      ₹{item.price}
                    </span>

                    {qty === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: 1,
                            image_url: item.image_url
                          });
                          toast.success(`Added ${item.name} to order`);
                        }}
                        className="bg-[#1A5C1A] text-white text-xs px-3.5 py-1.5"
                      >
                        Add to Order
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#E8F0E8] px-2 py-1 rounded-lg border border-[#1A5C1A]/20">
                        <button
                          onClick={() => updateCartQuantity(item.id, qty - 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#1A5C1A] font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-[#1A5C1A]">{qty}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, qty + 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#1A5C1A] font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Cart Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-[#D4AF37]/50 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#1A5C1A]" /> Pre-Order Cart
              </h3>
              <Badge variant="gold">{cart.length} items</Badge>
            </div>

            {cart.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">
                Your pre-order cart is empty. Pick signature dishes to have them served hot upon arrival.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {cart.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                      <div>
                        <p className="font-semibold text-stone-800">{c.name}</p>
                        <p className="text-stone-500">₹{c.price} × {c.quantity}</p>
                      </div>
                      <span className="font-bold text-[#1A5C1A]">
                        ₹{c.price * c.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-bold">₹{cartTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">GST (5%)</span>
                    <span className="font-bold">₹{Math.round(cartTotal() * 0.05)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-200">
                    <span>Total Amount</span>
                    <span className="text-[#1A5C1A]">₹{Math.round(cartTotal() * 1.05)}</span>
                  </div>
                </div>

                <Link href="/book">
                  <Button
                    className="w-full bg-[#1A5C1A] text-white text-xs py-3 mt-2 flex items-center justify-center gap-1.5"
                  >
                    Proceed to Table Booking <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dish AI Info & Q&A Modal */}
      {selectedAskDish && (
        <DishAskModal
          dish={selectedAskDish}
          isOpen={!!selectedAskDish}
          onClose={() => setSelectedAskDish(null)}
        />
      )}
    </div>
  );
}

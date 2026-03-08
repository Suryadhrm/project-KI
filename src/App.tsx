/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MerchantCard } from './components/MerchantCard';
import { MerchantDetail } from './components/MerchantDetail';
import { Cart } from './components/Cart';
import { FoodAssistant } from './components/FoodAssistant';
import { UMKMView } from './components/UMKMView';
import { AdminView } from './components/AdminView';
import { CATEGORIES } from './data';
import { Merchant, MenuItem, CartItem, User, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ChevronRight, ShoppingCart, User as UserIcon, Shield, Store } from 'lucide-react';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/merchants');
      const data = await res.json();
      setMerchants(data);
    } catch (e) {
      console.error("Failed to fetch merchants", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
    // Check local storage for session
    const savedUser = localStorage.getItem('ipb_food_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ipb_food_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedMerchant(null);
    localStorage.removeItem('ipb_food_user');
    setIsAuthOpen(true);
  };

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const matchesCategory = activeCategory === 'Semua' || m.category === activeCategory;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [merchants, activeCategory, searchQuery]);

  const handleAddToCart = (item: MenuItem, merchant: Merchant) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, merchantId: merchant.id, merchantName: merchant.name }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const currentRole = user?.role || 'CUSTOMER';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onHomeClick={() => setSelectedMerchant(null)}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          if (selectedMerchant) {
            setSelectedMerchant(null);
          }
        }}
      />

      {(currentRole === 'CUSTOMER' || currentRole === 'ADMIN') ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentRole === 'ADMIN' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="text-sm font-bold text-red-800">Mode Administrator Aktif</span>
              </div>
              <button 
                onClick={() => setSelectedMerchant({ id: 'admin-panel' } as any)}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Buka Panel Admin
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!selectedMerchant ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Hero Section */}
                <section className="mb-12 relative rounded-3xl overflow-hidden h-[300px] md:h-[400px]">
                  <img 
                    src="https://picsum.photos/seed/ipbfood/1200/600" 
                    alt="Hero" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent flex flex-col justify-center p-8 md:p-16">
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="font-display font-bold text-4xl md:text-6xl text-white mb-4 max-w-xl"
                    >
                      Lapar di Kampus? <br/>
                      <span className="text-emerald-400">IPB Food</span> Solusinya!
                    </motion.h1>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-emerald-50 text-lg mb-8 max-w-md"
                    >
                      Pesan makanan favoritmu dari kantin dan UMKM sekitar IPB Dramaga dengan mudah.
                    </motion.p>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button className="btn-primary px-8 py-3 text-lg">
                        Pesan Sekarang
                      </button>
                    </motion.div>
                  </div>
                </section>

                {/* Search & Filter */}
                <div className="mb-8 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Cari nasi goreng, seblak, atau kopi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                    <button className="btn-secondary px-6">
                      <Filter className="w-5 h-5" />
                      Filter
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm ${
                          activeCategory === cat
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Merchant Grid */}
                <section>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-slate-800">Daftar UMKM Terverifikasi</h2>
                      <p className="text-slate-500 text-sm">Pilihan terbaik di sekitar Dramaga</p>
                    </div>
                    <button className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Lihat Semua <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)}
                    </div>
                  ) : filteredMerchants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {filteredMerchants.map((merchant) => (
                        <MerchantCard 
                          key={merchant.id} 
                          merchant={merchant} 
                          onClick={setSelectedMerchant} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                      <p className="text-slate-400">Wah, merchant yang kamu cari belum ketemu nih...</p>
                    </div>
                  )}
                </section>
              </motion.div>
            ) : selectedMerchant.id === 'admin-panel' ? (
              <AdminView key="admin" />
            ) : (
              <MerchantDetail 
                key="detail"
                merchant={selectedMerchant} 
                onBack={() => { setSelectedMerchant(null); fetchMerchants(); }}
                onAddToCart={handleAddToCart}
                user={user}
                onAuthRequired={() => setIsAuthOpen(true)}
              />
            )}
          </AnimatePresence>
        </main>
      ) : (
        <UMKMView user={user!} />
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleLoginSuccess} 
      />

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="18" fill="url(#grad_logo_footer)" />
                  <path d="M10.5 10V14.5C10.5 16 11.5 17 12.5 17V25H14.5V17C15.5 17 16.5 16 16.5 14.5V10H15.3V14H14.1V10H12.9V14H11.7V10H10.5Z" fill="white" />
                  <path d="M22.5 10C20.8 10 19.5 11.8 19.5 14C19.5 15.8 20.4 17.3 21.5 17.8V25H23.5V17.8C24.6 17.3 25.5 15.8 25.5 14C25.5 11.8 24.2 10 22.5 10Z" fill="white" />
                  <defs>
                    <linearGradient id="grad_logo_footer" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6EE7B7" />
                      <stop offset="1" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-display font-bold text-xl text-emerald-700">
                  IPB Food
                </span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Mendukung UMKM lokal dan memudahkan pelanggan mendapatkan makanan berkualitas dengan harga terjangkau.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Layanan</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-emerald-600">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-emerald-600">Cara Memesan</a></li>
                <li><a href="#" className="hover:text-emerald-600">Daftar Merchant</a></li>
                <li><a href="#" className="hover:text-emerald-600">Karir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Kontak</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li>Email: support@ipbfood.id</li>
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Dramaga, Bogor, Jawa Barat</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-12 pt-8 text-center text-slate-400 text-xs">
            © 2024 IPB Food & UMKM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

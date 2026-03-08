import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Merchant, MenuItem, User } from '../types';
import { ReviewSystem } from './ReviewSystem';

interface MerchantDetailProps {
  merchant: Merchant;
  onBack: () => void;
  onAddToCart: (item: MenuItem, merchant: Merchant) => void;
  user: User | null;
  onAuthRequired: () => void;
}

export const MerchantDetail: React.FC<MerchantDetailProps> = ({ merchant, onBack, onAddToCart, user, onAuthRequired }) => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`/api/merchants/${merchant.id}/products`);
      const data = await res.json();
      setProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
  }, [merchant.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-20"
    >
      <div className="relative h-64 md:h-80">
        <img
          src={merchant.image}
          alt={merchant.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {merchant.category}
            </span>
            <div className="flex items-center gap-1 text-sm font-bold">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {merchant.rating}
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">{merchant.name}</h1>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {merchant.deliveryTime}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {merchant.distance}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-6">Menu Unggulan</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.length > 0 ? products.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-emerald-600">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <button 
                        onClick={() => onAddToCart(item, merchant)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 col-span-2 text-center py-10">Belum ada menu yang ditambahkan.</p>
              )}
            </div>
          )}
        </div>

        <ReviewSystem merchantId={merchant.id} user={user} onAuthRequired={onAuthRequired} />
      </div>
    </motion.div>
  );
};

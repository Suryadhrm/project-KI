import React from 'react';
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Merchant } from '../types';

interface MerchantCardProps {
  merchant: Merchant;
  onClick: (merchant: Merchant) => void;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ merchant, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
      onClick={() => onClick(merchant)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={merchant.image}
          alt={merchant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-800">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          {merchant.rating}
        </div>
        {merchant.is_verified === 1 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg" title="Terverifikasi">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-display font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
            {merchant.name}
          </h3>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-1 mb-3">
          {merchant.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {merchant.deliveryTime}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {merchant.distance}
          </div>
          <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
            {merchant.category}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

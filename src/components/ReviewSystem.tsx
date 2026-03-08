import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Lock } from 'lucide-react';
import { Review, User } from '../types';

interface ReviewSystemProps {
  merchantId: string;
  user: User | null;
  onAuthRequired: () => void;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({ merchantId, user, onAuthRequired }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    const res = await fetch(`/api/merchants/${merchantId}/reviews`);
    const data = await res.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [merchantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!comment) return;
    setIsSubmitting(true);
    
    await fetch(`/api/merchants/${merchantId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: user.id, 
        user_name: user.name, 
        rating, 
        comment 
      })
    });

    setComment('');
    setIsSubmitting(false);
    fetchReviews();
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-8">
      <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-emerald-600" />
        Ulasan Pengguna
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Tulis Ulasan sebagai {user.name}</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`p-1 transition-colors ${rating >= s ? 'text-yellow-500' : 'text-slate-300'}`}
                >
                  <Star className={`w-5 h-5 ${rating >= s ? 'fill-yellow-500' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Apa pendapatmu tentang makanan di sini?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 h-24 mb-4"
            required
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto px-8">
            {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-50 p-8 rounded-2xl mb-8 text-center border border-dashed border-slate-200">
          <Lock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">Silakan masuk untuk memberikan ulasan.</p>
          <button onClick={onAuthRequired} className="btn-secondary mx-auto">
            Masuk Sekarang
          </button>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Belum ada ulasan. Jadi yang pertama memberi ulasan!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-800">{review.user_name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(review.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="text-slate-600 text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    if (!isOpen) {
      setError('');
      setShowOtp(false);
      setOtp('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        if (data.requireOtp) {
          setShowOtp(true);
          setResendTimer(60);
        } else {
          onSuccess(data);
          onClose();
        }
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
        onClose();
      } else {
        setError(data.error || 'Kode OTP salah');
      }
    } catch (err) {
      setError('Gagal memverifikasi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setIsLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setResendTimer(60);
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal mengirim ulang OTP');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[110] rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display font-bold text-2xl">
                  {isLogin ? 'Masuk ke IPB Food' : 'Daftar Akun Baru'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}

              {showOtp ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Cek Email Kamu</h3>
                    <p className="text-sm text-slate-500">
                      Kami telah mengirimkan kode OTP 6 digit ke<br/>
                      <span className="font-medium text-slate-900">{email}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 text-center">Kode OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full btn-primary py-3 mt-4 disabled:opacity-50"
                  >
                    {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-sm text-emerald-600 font-medium disabled:text-slate-400 hover:underline"
                    >
                      {resendTimer > 0 ? `Kirim ulang dalam ${resendTimer}s` : 'Kirim ulang kode OTP'}
                    </button>
                  </div>
                  
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Kembali
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Nama kamu"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email IPB / Umum</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Daftar Sebagai</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('CUSTOMER')}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                          role === 'CUSTOMER' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Pelanggan
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('UMKM')}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                          role === 'UMKM' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Pemilik UMKM
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 mt-4"
                >
                  {isLoading ? 'Memproses...' : isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
                </button>
              </form>
              )}

              {!showOtp && (
                <div className="mt-8 text-center text-sm text-slate-500">
                  {isLogin ? (
                    <p>
                      Belum punya akun?{' '}
                      <button onClick={() => setIsLogin(false)} className="text-emerald-600 font-bold hover:underline">
                        Daftar di sini
                      </button>
                    </p>
                  ) : (
                    <p>
                      Sudah punya akun?{' '}
                      <button onClick={() => setIsLogin(true)} className="text-emerald-600 font-bold hover:underline">
                        Masuk di sini
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

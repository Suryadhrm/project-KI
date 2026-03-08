import React, { useState, useEffect } from 'react';
import { Shield, Trash2, User as UserIcon, Store, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Merchant, User } from '../types';

export const AdminView: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'merchants' | 'users'>('merchants');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [mRes, uRes] = await Promise.all([
      fetch('/api/merchants'),
      fetch('/api/users')
    ]);
    const [mItems, uItems] = await Promise.all([mRes.json(), uRes.json()]);
    setMerchants(mItems);
    setUsers(uItems);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMerchant = async (id: string) => {
    if (!window.confirm('Hapus UMKM ini?')) return;
    await fetch(`/api/merchants/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleVerifyMerchant = async (id: string, status: boolean) => {
    await fetch(`/api/merchants/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_verified: status })
    });
    fetchData();
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Hapus pengguna ini?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-100 p-3 rounded-2xl">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Panel Admin</h1>
          <p className="text-slate-500">Kelola semua data UMKM dan pengguna IPB Food</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total UMKM</h3>
          <p className="text-3xl font-bold text-slate-800">{merchants.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Pengguna</h3>
          <p className="text-3xl font-bold text-slate-800">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-slate-400 text-sm font-medium mb-1">UMKM Terverifikasi</h3>
          <p className="text-3xl font-bold text-emerald-600">
            {merchants.filter(m => m.is_verified === 1).length}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('merchants')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'merchants' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Kelola UMKM
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Kelola Pengguna
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === 'merchants' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {merchants.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={m.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-bold text-slate-700">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.category}</td>
                    <td className="px-6 py-4">
                      {m.is_verified === 1 ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Terverifikasi</span>
                      ) : (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {m.is_verified === 0 ? (
                          <button 
                            onClick={() => handleVerifyMerchant(m.id, true)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Verifikasi"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleVerifyMerchant(m.id, false)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Batalkan Verifikasi"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteMerchant(m.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        u.role === 'ADMIN' ? 'bg-red-50 text-red-600' : 
                        u.role === 'UMKM' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

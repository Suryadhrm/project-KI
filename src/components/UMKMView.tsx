import React, { useState, useEffect } from 'react';
import { Plus, Store, Package, Trash2, LayoutDashboard, Edit3, Star, MessageSquare, X } from 'lucide-react';
import { Merchant, MenuItem, Review, User } from '../types';

interface UMKMViewProps {
  user: User;
}

export const UMKMView: React.FC<UMKMViewProps> = ({ user }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [viewingReviews, setViewingReviews] = useState<Review[] | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [merchantToDelete, setMerchantToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form states
  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [merchantProducts, setMerchantProducts] = useState<Record<string, MenuItem[]>>({});

  // Form states
  const [newMerchant, setNewMerchant] = useState({ name: '', description: '', category: 'Makanan Berat', image: 'https://picsum.photos/seed/new/600/400' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: 0, category: 'Umum', image: 'https://picsum.photos/seed/prod/400/300' });

  const fetchMyMerchants = async () => {
    console.log('Fetching merchants for user:', user.id);
    const res = await fetch(`/api/merchants/owner/${user.id}`);
    const data = await res.json();
    const merchantList = Array.isArray(data) ? data : (data ? [data] : []);
    setMerchants(merchantList);
    
    // Fetch products for each merchant
    const productsMap: Record<string, MenuItem[]> = {};
    for (const m of merchantList) {
      console.log('Fetching products for merchant:', m.id);
      const pRes = await fetch(`/api/merchants/${m.id}/products`);
      const pData = await pRes.json();
      productsMap[m.id] = pData;
    }
    setMerchantProducts(productsMap);
  };

  useEffect(() => {
    fetchMyMerchants();
  }, [user.id]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditingMerchant ? 'PUT' : 'POST';
    const endpoint = isEditingMerchant && selectedMerchant ? `/api/merchants/${selectedMerchant.id}` : '/api/merchants';
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMerchant, owner_id: user.id })
      });

      if (response.ok) {
        setToast({ message: isEditingMerchant ? 'Profil UMKM berhasil diperbarui!' : 'UMKM berhasil didaftarkan!', type: 'success' });
      } else {
        setToast({ message: 'Gagal menyimpan UMKM.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Terjadi kesalahan.', type: 'error' });
    } finally {
      setIsRegistering(false);
      setIsEditingMerchant(false);
      setSelectedMerchant(null);
      fetchMyMerchants();
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;

    const endpoint = editingProduct 
      ? `/api/products/${editingProduct.id}` 
      : `/api/merchants/${selectedMerchant.id}/products`;
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        setToast({ message: editingProduct ? 'Menu berhasil diperbarui!' : 'Menu berhasil ditambahkan!', type: 'success' });
      } else {
        setToast({ message: 'Gagal menyimpan menu.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Terjadi kesalahan.', type: 'error' });
    } finally {
      setIsAddingProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: 0, category: 'Umum', image: 'https://picsum.photos/seed/prod/400/300' });
      fetchMyMerchants();
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setToast({ message: 'Menu berhasil dihapus!', type: 'success' });
        // Optimistic update
        setMerchantProducts(prev => {
          const newState = { ...prev };
          for (const merchantId in newState) {
            newState[merchantId] = newState[merchantId].filter(p => p.id !== productId);
          }
          return newState;
        });
        // Also refetch to be sure
        await fetchMyMerchants();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setToast({ message: `Gagal menghapus menu: ${errorData.error || 'Terjadi kesalahan'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ message: 'Terjadi kesalahan saat menghapus menu.', type: 'error' });
    } finally {
      setProductToDelete(null);
      // Auto hide toast
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteMerchant = async (merchantId: string) => {
    try {
      const response = await fetch(`/api/merchants/${merchantId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setToast({ message: 'Usaha berhasil dihapus!', type: 'success' });
        // Optimistic update
        setMerchants(prev => prev.filter(m => m.id !== merchantId));
        // Also refetch to be sure
        await fetchMyMerchants();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setToast({ message: `Gagal menghapus usaha: ${errorData.error || 'Terjadi kesalahan'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting merchant:', error);
      setToast({ message: 'Terjadi kesalahan saat menghapus usaha.', type: 'error' });
    } finally {
      setMerchantToDelete(null);
      // Auto hide toast
      setTimeout(() => setToast(null), 3000);
    }
  };

  const fetchReviews = async (merchantId: string) => {
    const res = await fetch(`/api/merchants/${merchantId}/reviews`);
    const data = await res.json();
    setViewingReviews(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-emerald-600" />
            Dashboard UMKM
          </h1>
          <p className="text-slate-500">Selamat datang kembali, {user.name}</p>
        </div>
        <button onClick={() => setIsRegistering(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          Daftar Usaha Baru
        </button>
      </div>

      {merchants.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
          <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-slate-800 mb-2">Belum Ada Usaha Terdaftar</h2>
          <p className="text-slate-500 mb-6">Mulai daftarkan UMKM kamu untuk menjangkau ribuan pelanggan!</p>
          <button onClick={() => setIsRegistering(true)} className="btn-primary mx-auto">
            Daftar Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {merchants.map(m => (
            <div key={m.id} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={m.image} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      {m.name}
                      {m.is_verified === 1 && <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
                    </h3>
                    <p className="text-sm text-slate-400">{m.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedMerchant(m);
                      setNewMerchant({ name: m.name, description: m.description || '', category: m.category || 'Makanan Berat', image: m.image || '' });
                      setIsEditingMerchant(true);
                      setIsRegistering(true);
                    }}
                    className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                    title="Edit Profil UMKM"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => fetchReviews(m.id)}
                    className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    title="Lihat Ulasan"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setMerchantToDelete(m.id)}
                    className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Hapus Usaha"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => { setSelectedMerchant(m); setIsAddingProduct(true); }}
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                    title="Tambah Produk"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Daftar Menu</h4>
                <div className="space-y-2">
                  {merchantProducts[m.id]?.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-xs text-emerald-600">Rp {p.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setSelectedMerchant(m);
                            setEditingProduct(p);
                            setProductForm({ name: p.name, description: p.description || '', price: p.price, category: p.category || 'Umum', image: p.image || '' });
                            setIsAddingProduct(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(p.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors relative z-10"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!merchantProducts[m.id] || merchantProducts[m.id].length === 0) && (
                    <p className="text-xs text-slate-400 italic">Belum ada produk. Tambahkan produk pertama kamu!</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals for Registering, Adding/Editing Product, and Viewing Reviews */}
      {isRegistering && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="font-display font-bold text-2xl mb-6">
              {isEditingMerchant ? 'Edit Profil UMKM' : 'Daftarkan UMKM Kamu'}
            </h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Usaha</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={newMerchant.name}
                  onChange={e => setNewMerchant({...newMerchant, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={newMerchant.description}
                  onChange={e => setNewMerchant({...newMerchant, description: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2"
                  value={newMerchant.category}
                  onChange={e => setNewMerchant({...newMerchant, category: e.target.value})}
                >
                  <option>Makanan Berat</option>
                  <option>Minuman</option>
                  <option>Cemilan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Usaha</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={newMerchant.image}
                  onChange={e => setNewMerchant({...newMerchant, image: e.target.value})}
                  placeholder="https://picsum.photos/..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsRegistering(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" className="btn-primary flex-1">
                  {isEditingMerchant ? 'Simpan Perubahan' : 'Daftar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingProduct && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="font-display font-bold text-2xl mb-2">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">Untuk: {selectedMerchant.name}</p>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={productForm.name}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={isNaN(productForm.price) ? '' : productForm.price}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setProductForm({...productForm, price: isNaN(val) ? 0 : val});
                  }}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Produk</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2"
                  value={productForm.category}
                  onChange={e => setProductForm({...productForm, category: e.target.value})}
                >
                  <option>Makanan</option>
                  <option>Minuman</option>
                  <option>Cemilan</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={productForm.description}
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Produk</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2" 
                  value={productForm.image}
                  onChange={e => setProductForm({...productForm, image: e.target.value})}
                  placeholder="https://picsum.photos/..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="btn-secondary flex-1">Batal</button>
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Simpan Produk' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingReviews && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-2xl">Ulasan Pelanggan</h2>
              <button onClick={() => setViewingReviews(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {viewingReviews.length === 0 ? (
                <p className="text-center text-slate-400 py-10">Belum ada ulasan untuk toko ini.</p>
              ) : (
                viewingReviews.map(r => (
                  <div key={r.id} className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-sm">{r.user_name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Hapus Menu?</h2>
            <p className="text-slate-500 mb-8 text-sm">
              Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)} 
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button 
                onClick={() => handleDeleteProduct(productToDelete)} 
                className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-all font-bold flex-1"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Merchant Deletion */}
      {merchantToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Hapus Usaha?</h2>
            <p className="text-slate-500 mb-8 text-sm">
              Apakah Anda yakin ingin menghapus usaha ini? Semua menu dan ulasan yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setMerchantToDelete(null)} 
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button 
                onClick={() => handleDeleteMerchant(merchantToDelete)} 
                className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-all font-bold flex-1"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-in ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Package className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

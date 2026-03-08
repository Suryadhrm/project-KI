import { Merchant } from './types';

export const MERCHANTS: Merchant[] = [
  {
    id: '1',
    name: 'Ayam Geprek IPB',
    description: 'Ayam geprek krispi dengan sambal korek khas Bogor.',
    image: 'https://picsum.photos/seed/geprek/600/400',
    rating: 4.8,
    deliveryTime: '15-25 min',
    distance: '0.8 km',
    category: 'Makanan Berat',
    menu: [
      {
        id: 'm1',
        name: 'Paket Geprek Hemat',
        description: 'Nasi + Ayam Geprek + Es Teh',
        price: 15000,
        image: 'https://picsum.photos/seed/m1/400/300',
        category: 'Paket'
      },
      {
        id: 'm2',
        name: 'Ayam Geprek Keju',
        description: 'Ayam geprek dengan topping keju mozarella leleh.',
        price: 20000,
        image: 'https://picsum.photos/seed/m2/400/300',
        category: 'Ala Carte'
      }
    ]
  },
  {
    id: '2',
    name: 'Kopi Kampus',
    description: 'Kopi susu gula aren dan berbagai varian minuman segar.',
    image: 'https://picsum.photos/seed/coffee/600/400',
    rating: 4.7,
    deliveryTime: '10-20 min',
    distance: '0.5 km',
    category: 'Minuman',
    menu: [
      {
        id: 'm3',
        name: 'Es Kopi Susu IPB',
        description: 'Kopi susu gula aren khas kampus.',
        price: 12000,
        image: 'https://picsum.photos/seed/m3/400/300',
        category: 'Kopi'
      },
      {
        id: 'm4',
        name: 'Matcha Latte',
        description: 'Minuman matcha premium dengan susu segar.',
        price: 15000,
        image: 'https://picsum.photos/seed/m4/400/300',
        category: 'Non-Kopi'
      }
    ]
  },
  {
    id: '3',
    name: 'Dimsum Bara',
    description: 'Dimsum hangat dengan berbagai varian isi.',
    image: 'https://picsum.photos/seed/dimsum/600/400',
    rating: 4.9,
    deliveryTime: '20-30 min',
    distance: '1.2 km',
    category: 'Cemilan',
    menu: [
      {
        id: 'm5',
        name: 'Dimsum Mix 4pcs',
        description: 'Campuran dimsum ayam, udang, dan jamur.',
        price: 18000,
        image: 'https://picsum.photos/seed/m5/400/300',
        category: 'Dimsum'
      }
    ]
  },
  {
    id: '4',
    name: 'Soto Kuning Pak Yus',
    description: 'Soto kuning legendaris khas Bogor.',
    image: 'https://picsum.photos/seed/soto/600/400',
    rating: 4.6,
    deliveryTime: '25-35 min',
    distance: '2.1 km',
    category: 'Makanan Berat',
    menu: [
      {
        id: 'm6',
        name: 'Soto Daging',
        description: 'Soto kuning dengan potongan daging sapi empuk.',
        price: 25000,
        image: 'https://picsum.photos/seed/m6/400/300',
        category: 'Soto'
      }
    ]
  }
];

export const CATEGORIES = [
  'Semua',
  'Makanan Berat',
  'Minuman',
  'Cemilan',
  'UMKM Lokal',
  'Sehat'
];

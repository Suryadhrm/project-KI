export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Merchant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  category: string;
  menu: MenuItem[];
  owner_id?: string;
  is_verified?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  merchantId: string;
  merchantName: string;
}

export interface Review {
  id: string;
  merchant_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type UserRole = 'CUSTOMER' | 'UMKM' | 'ADMIN';

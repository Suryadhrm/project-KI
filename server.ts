import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const db = new Database('ipbfood.db');

// OTP Storage (In-memory for simplicity)
const otps = new Map<string, { otp: string, data: any, expiresAt: number }>();

// Demo OTP Sender
async function sendOTPEmail(email: string, otp: string) {
  console.log(`[DEMO MODE] OTP for ${email} is: ${otp}`);
  return true;
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CUSTOMER'
  );

  CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    deliveryTime TEXT,
    distance TEXT,
    category TEXT,
    owner_id TEXT,
    is_verified INTEGER DEFAULT 0,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    merchant_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER,
    image TEXT,
    category TEXT,
    FOREIGN KEY(merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    merchant_id TEXT,
    user_id TEXT,
    user_name TEXT,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial admin and data
const adminExists = db.prepare('SELECT * FROM users WHERE role = ?').get('ADMIN');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run('admin-1', 'Admin IPB Food', 'admin@ipb.ac.id', hashedPassword, 'ADMIN');
}

async function startServer() {
  const app = express();
  app.use(express.json());

// Auth Endpoints
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const otp = '123456'; // Demo OTP
      const { password: _, ...userWithoutPassword } = user;
      
      otps.set(email, {
        otp,
        data: { type: 'login', user: userWithoutPassword },
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      });
      
      await sendOTPEmail(email, otp);
      res.json({ requireOtp: true, email });
    } else {
      res.status(401).json({ error: 'Email atau kata sandi salah' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const otp = '123456'; // Demo OTP
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    
    otps.set(email, {
      otp,
      data: { type: 'register', user: { id, name, email, password: hashedPassword, role: role || 'CUSTOMER' } },
      expiresAt: Date.now() + 5 * 60 * 1000
    });
    
    await sendOTPEmail(email, otp);
    res.json({ requireOtp: true, email });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const storedData = otps.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Sesi OTP tidak ditemukan atau sudah kedaluwarsa' });
    }
    
    if (Date.now() > storedData.expiresAt) {
      otps.delete(email);
      return res.status(400).json({ error: 'Kode OTP sudah kedaluwarsa' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Kode OTP salah' });
    }
    
    // OTP is valid
    const { type, user } = storedData.data;
    
    if (type === 'register') {
      try {
        db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
          .run(user.id, user.name, user.email, user.password, user.role);
        
        const { password: _, ...userWithoutPassword } = user;
        otps.delete(email);
        res.json(userWithoutPassword);
      } catch (e) {
        res.status(400).json({ error: 'Gagal membuat akun' });
      }
    } else if (type === 'login') {
      otps.delete(email);
      res.json(user);
    }
  });

  // User Management
  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT id, name, email, role FROM users').all();
    res.json(users);
  });

  app.delete('/api/users/:id', (req, res) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Merchant Endpoints
  app.get('/api/merchants', (req, res) => {
    const merchants = db.prepare('SELECT * FROM merchants').all();
    res.json(merchants);
  });

  app.post('/api/merchants', (req, res) => {
    const { name, description, image, category, owner_id } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO merchants (id, name, description, image, category, deliveryTime, distance, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, description, image, category, '20-30 min', '1.0 km', owner_id);
    res.json({ id, name });
  });

  app.get('/api/merchants/owner/:ownerId', (req, res) => {
    const merchants = db.prepare('SELECT * FROM merchants WHERE owner_id = ?').all(req.params.ownerId);
    res.json(merchants);
  });

  app.put('/api/merchants/:id', (req, res) => {
    const { name, description, image, category } = req.body;
    db.prepare('UPDATE merchants SET name = ?, description = ?, image = ?, category = ? WHERE id = ?')
      .run(name, description, image, category, req.params.id);
    res.json({ success: true });
  });

  app.patch('/api/merchants/:id/verify', (req, res) => {
    const { is_verified } = req.body;
    db.prepare('UPDATE merchants SET is_verified = ? WHERE id = ?').run(is_verified ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/merchants/:id', (req, res) => {
    db.prepare('DELETE FROM merchants WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Product Endpoints
  app.get('/api/merchants/:id/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products WHERE merchant_id = ?').all(req.params.id);
    res.json(products);
  });

  app.delete('/api/products/:id', (req, res) => {
    console.log(`Deleting product with ID: ${req.params.id}`);
    try {
      const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
      console.log(`Delete result: ${JSON.stringify(result)}`);
      if (result.changes > 0) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/merchants/:id/products', (req, res) => {
    const { name, description, price, image, category } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO products (id, merchant_id, name, description, price, image, category) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.params.id, name, description, price, image, category);
    res.json({ id, name });
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, description, price, image } = req.body;
    db.prepare('UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?')
      .run(name, description, price, image, req.params.id);
    res.json({ success: true });
  });

  // Review Endpoints
  app.get('/api/merchants/:id/reviews', (req, res) => {
    const reviews = db.prepare('SELECT * FROM reviews WHERE merchant_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(reviews);
  });

  app.post('/api/merchants/:id/reviews', (req, res) => {
    const { user_id, user_name, rating, comment } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO reviews (id, merchant_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, req.params.id, user_id, user_name, rating, comment);
    
    const avg = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE merchant_id = ?').get(req.params.id) as { avg: number };
    db.prepare('UPDATE merchants SET rating = ? WHERE id = ?').run(avg.avg.toFixed(1), req.params.id);
    
    res.json({ id, success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();

import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('billtrack.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    address TEXT,
    obCode TEXT
  );

  CREATE TABLE IF NOT EXISTS obs (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    date TEXT,
    customerCode TEXT,
    obCode TEXT,
    billNumber TEXT UNIQUE,
    shopName TEXT,
    shopAddress TEXT,
    billType TEXT,
    billAmount REAL,
    recovery REAL DEFAULT 0,
    balance REAL
  );

  CREATE TABLE IF NOT EXISTS recoveries (
    id TEXT PRIMARY KEY,
    billNumber TEXT,
    billDate TEXT,
    recoveryDate TEXT,
    type TEXT,
    billAmountAtRecovery REAL,
    recoveryAmount REAL,
    remainingAmount REAL
  );
`);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/dashboard', (req, res) => {
    try {
      const bills = db.prepare('SELECT * FROM bills').all();
      const recoveries = db.prepare('SELECT * FROM recoveries').all();
      const customers = db.prepare('SELECT * FROM customers').all();
      const obs = db.prepare('SELECT * FROM obs').all();
      res.json({ bills, recoveries, customers, obs });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/bills', (req, res) => {
    try {
      const bill = req.body;
      const stmt = db.prepare(`
        INSERT INTO bills (id, date, customerCode, obCode, billNumber, shopName, shopAddress, billType, billAmount, recovery, balance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        bill.id, bill.date, bill.customerCode, bill.obCode, bill.billNumber,
        bill.shopName, bill.shopAddress, bill.billType, bill.billAmount,
        bill.recovery || 0, bill.balance
      );
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/bills/:id', (req, res) => {
    try {
      const { id } = req.params;
      // Get bill number first to delete associated recoveries
      const bill = db.prepare('SELECT billNumber FROM bills WHERE id = ?').get() as any;
      if (bill) {
        db.prepare('DELETE FROM recoveries WHERE billNumber = ?').run(bill.billNumber);
      }
      db.prepare('DELETE FROM bills WHERE id = ?').run(id);
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/recoveries', (req, res) => {
    try {
      const recovery = req.body;
      const stmt = db.prepare(`
        INSERT INTO recoveries (id, billNumber, billDate, recoveryDate, type, billAmountAtRecovery, recoveryAmount, remainingAmount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        recovery.id, recovery.billNumber, recovery.billDate, recovery.recoveryDate,
        recovery.type, recovery.billAmountAtRecovery, recovery.recoveryAmount, recovery.remainingAmount
      );

      // Update bill balance and recovery total
      const bill = db.prepare('SELECT * FROM bills WHERE billNumber = ?').get() as any;
      if (bill) {
        const newRecovery = (bill.recovery || 0) + recovery.recoveryAmount;
        const newBalance = bill.billAmount - newRecovery;
        db.prepare('UPDATE bills SET recovery = ?, balance = ? WHERE billNumber = ?')
          .run(newRecovery, newBalance, recovery.billNumber);
      }

      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/customers', (req, res) => {
    try {
      const customer = req.body;
      const stmt = db.prepare(`
        INSERT INTO customers (id, code, name, address, obCode)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(customer.id, customer.code, customer.name, customer.address, customer.obCode);
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/customers/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/obs', (req, res) => {
    try {
      const ob = req.body;
      const stmt = db.prepare(`
        INSERT INTO obs (id, code, name, phone)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(ob.id, ob.code, ob.name, ob.phone);
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/obs/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM obs WHERE id = ?').run(req.params.id);
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

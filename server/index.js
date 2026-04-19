import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Initialize Database Tables
const initDb = async () => {
  try {
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(255) NOT NULL DEFAULT 'N/A',
        citizen_id VARCHAR(255) NOT NULL DEFAULT 'N/A',
        approved BOOLEAN DEFAULT FALSE
      )
    `);

    // Add columns if they don't exist (for existing tables)
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS citizen_id VARCHAR(255)');

    // For existing users that have NULL values, set a default
    await pool.query("UPDATE users SET phone = 'N/A' WHERE phone IS NULL");
    await pool.query("UPDATE users SET citizen_id = 'N/A' WHERE citizen_id IS NULL");

    // Scale to NOT NULL
    await pool.query('ALTER TABLE users ALTER COLUMN phone SET NOT NULL');
    await pool.query('ALTER TABLE users ALTER COLUMN citizen_id SET NOT NULL');

    // Create Appointments Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id),
        doctor_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        time TIME NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Default Admin if not exists
    const adminExists = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@clinic.com']);
    if (adminExists.rowCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password, name, role, approved) VALUES ($1, $2, $3, $4, $5)',
        ['admin@clinic.com', hashedPassword, 'Admin User', 'admin', true]
      );
      console.log('Default admin account created.');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initDb();
// -----------------

// Helper to get user auth from header
const getAuthUser = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [token]);
  return res.rows[0] || null;
};

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.approved && user.role !== 'customer' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Account not approved' });
      }
      // Convert ID to string for frontend compatibility if needed
      const userObj = { ...user, id: user.id.toString() };
      delete userObj.password;
      return res.json({ user: userObj, token: user.id.toString() });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, role, phone, citizenId } = req.body;
  
  if (!email || !password || !name || !role || !phone || !citizenId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (role === 'admin') {
    return res.status(403).json({ error: 'Admin registration not allowed' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const approved = role === 'customer'; // Only customers auto-approved now

    const newUserRes = await pool.query(
      'INSERT INTO users (email, password, name, role, approved, phone, citizen_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, role, approved, phone, citizen_id as "citizenId"',
      [email, hashedPassword, name, role, approved, phone, citizenId]
    );

    const newUser = { ...newUserRes.rows[0], id: newUserRes.rows[0].id.toString() };
    res.status(201).json({ user: newUser, token: newUser.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const userObj = { ...user, id: user.id.toString() };
  delete userObj.password;
  res.json({ user: userObj });
});

// --- USERS ROUTES ---
app.get('/api/users', async (req, res) => {
  try {
    const usersRes = await pool.query('SELECT id, email, name, role, phone, citizen_id as "citizenId", approved FROM users');
    const users = usersRes.rows.map(u => ({ ...u, id: u.id.toString() }));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/users/:userId/approval', async (req, res) => {
  const { userId } = req.params;
  const { approved } = req.body;
  try {
    await pool.query('UPDATE users SET approved = $1 WHERE id = $2', [approved, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- APPOINTMENTS ROUTES ---
app.get('/api/appointments', async (req, res) => {
  try {
    const aptRes = await pool.query(`
      SELECT 
        a.id::text, 
        a.customer_id::text as "customerId", 
        u1.name as "customerName", 
        u1.email as "customerEmail",
        a.doctor_id::text as "doctorId", 
        u2.name as "doctorName",
        a.date::text, 
        a.time::text, 
        a.reason, 
        a.status,
        a.created_at as "createdAt"
      FROM appointments a
      JOIN users u1 ON a.customer_id = u1.id
      JOIN users u2 ON a.doctor_id = u2.id
      ORDER BY a.created_at DESC
    `);
    res.json({ appointments: aptRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can create appointments' });
  }

  let { doctorId, date, time, reason } = req.body;
  
  try {
    // If no doctor selected, find an available one
    if (!doctorId) {
      const availableDoctorRes = await pool.query(`
        SELECT id FROM users 
        WHERE role = 'doctor' AND approved = true 
        AND id NOT IN (
          SELECT doctor_id FROM appointments 
          WHERE date = $1 AND time = $2 AND status != 'rejected'
        )
        LIMIT 1
      `, [date, time]);

      if (availableDoctorRes.rowCount === 0) {
        return res.status(400).json({ error: 'No doctors available for this time slot.' });
      }
      doctorId = availableDoctorRes.rows[0].id;
    }

    const newAptRes = await pool.query(
      'INSERT INTO appointments (customer_id, doctor_id, date, time, reason) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user.id, doctorId, date, time, reason]
    );
    res.status(201).json({ appointmentId: newAptRes.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/appointments/:appointmentId/status', async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, appointmentId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

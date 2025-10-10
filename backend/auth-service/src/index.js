import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pkg from 'pg'

const { Pool } = pkg

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 4001
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'lostandfound',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres'
})

async function init() {
  await pool.query(`
    create table if not exists users (
      id serial primary key,
      email text unique not null,
      password_hash text not null,
      created_at timestamptz default now()
    );
  `)
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' })
})

app.post('/register', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'insert into users (email, password_hash) values ($1, $2) returning id, email, created_at',
      [email, hash]
    )
    res.status(201).json({ user: result.rows[0] })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'email already exists' })
    res.status(500).json({ error: 'registration failed' })
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const r = await pool.query('select id, email, password_hash from users where email=$1', [email])
    if (!r.rows[0]) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, r.rows[0].password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ sub: r.rows[0].id, email: r.rows[0].email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch {
    res.status(500).json({ error: 'login failed' })
  }
})

app.get('/verify', (req, res) => {
  const header = req.headers['authorization'] || ''
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    res.json({ valid: true, user: payload })
  } catch {
    res.status(401).json({ valid: false, error: 'invalid token' })
  }
})

init().then(() => {
  app.listen(PORT, () => {
    console.log(`auth-service listening on ${PORT}`)
  })
})



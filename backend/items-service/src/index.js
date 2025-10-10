import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import pkg from 'pg'
import nodemailer from 'nodemailer'

const { Pool } = pkg

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 4002
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER || 'prasanthsampath2005@gmail.com'
const SMTP_PASS = process.env.SMTP_PASS || 'dktq thsu srdn wirf'
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'prasanthsampath2005@gmail.com'
const mailer = (SMTP_HOST && SMTP_USER) ? nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
}) : null

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'lostandfound',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres'
})

async function init() {
  await pool.query(`
    create table if not exists items (
      id serial primary key,
      title text not null,
      description text,
      location text,
      status text not null default 'lost', -- 'lost' | 'found'
      user_id integer,
      contact_email text,
      contact_phone text,
      created_at timestamptz default now()
    );
    create index if not exists items_title_idx on items using gin (to_tsvector('english', title));
  `)
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'items-service' })
})

function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || ''
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'invalid token' })
  }
}

app.get('/items', async (req, res) => {
  const { q, status } = req.query
  try {
    let sql = 'select * from items'
    const params = []
    const conds = []
    if (q) {
      params.push(q)
      conds.push("to_tsvector('english', title) @@ plainto_tsquery('english', $" + params.length + ")")
    }
    if (status) {
      params.push(status)
      conds.push(`status = $${params.length}`)
    }
    if (conds.length) sql += ' where ' + conds.join(' and ')
    sql += ' order by created_at desc limit 100'
    const r = await pool.query(sql, params)
    res.json({ items: r.rows })
  } catch {
    res.status(500).json({ error: 'failed to list items' })
  }
})

app.post('/items', requireAuth, async (req, res) => {
  const { title, description, location, status, contact_email, contact_phone } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title required' })
  try {
    const r = await pool.query(
      'insert into items (title, description, location, status, user_id, contact_email, contact_phone) values ($1,$2,$3,$4,$5,$6,$7) returning *',
      [title, description || null, location || null, status || 'lost', req.user.sub, contact_email || null, contact_phone || null]
    )
    const item = r.rows[0]
    // Fire-and-forget email to reporter when a lost item is created (if email provided)
    console.log('item', item.status)
    console.log('item_contact_email', item.contact_email)
    console.log('mailer', mailer)
    if (mailer && item.status === 'lost' && item.contact_email) {
      mailer.sendMail({
        from: SENDER_EMAIL,
        to: item.contact_email,
        subject: 'Lost item reported',
        text: `We have recorded your lost item: ${item.title}. We will notify you upon any updates.`
      }).catch((error) => {console.log(error)})
    }
    res.status(201).json({ item })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error: 'failed to create item' })
  }
})

// Mark an item as found
app.post('/items/:id/found', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    const r = await pool.query('update items set status = $1 where id = $2 returning *', ['found', id])
    if (!r.rows[0]) return res.status(404).json({ error: 'item not found' })
    const item = r.rows[0]
    if (mailer && item.contact_email) {
      mailer.sendMail({
        from: SENDER_EMAIL,
        to: item.contact_email,
        subject: 'Good news: Your lost item may be found',
        text: `An item matching your report "${item.title}" was marked as found. Please check the app for details.`
      }).catch(() => {})
    }
    res.json({ item })
  } catch {
    res.status(500).json({ error: 'failed to mark as found' })
  }
})

init().then(() => {
  app.listen(PORT, () => {
    console.log(`items-service listening on ${PORT}`)
  })
})



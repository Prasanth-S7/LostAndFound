import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import pkg from 'pg'
import nodemailer from 'nodemailer'
import dotenv from "dotenv"
import axios from "axios"
dotenv.config();

const { Pool } = pkg

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT
const JWT_SECRET = process.env.JWT_SECRET
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SENDER_EMAIL = process.env.SENDER_EMAIL
const mailer = (SMTP_HOST && SMTP_USER) ? nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
}) : null

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'development' ? false : true
})

async function init() {
  await pool.query(`
    create table if not exists items (
      id serial primary key,
      title text not null,
      description text,
      location text,
      category text,
      status text not null default 'lost', -- 'lost' | 'found'
      user_id integer,
      contact_email text,
      contact_phone text,
      created_at timestamptz default now()
    );
    create index if not exists items_title_idx on items using gin (to_tsvector('english', title));
  `)
}

async function getEmbedding(text) {
  // console.log(process.env.AZURE_OPENAI_ENDPOINT)
  const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/embeddings?api-version=2023-05-15`
  const response = await axios.post(
    endpoint,
    { input: text },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY
      }
    }
  )
  return response.data.data[0].embedding
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
  const { title, description, location, status, contact_email, contact_phone, category } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title required' })
  try {
    const embedding = await getEmbedding(`${title} ${description || ''}`)
    const embeddingStr = `[${embedding.join(',')}]`;

    const r = await pool.query(
      `INSERT INTO items 
       (title, description, location, category, status, user_id, contact_email, contact_phone, embedding)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        title,
        description || null,
        location || null,
        category || null,
        status || 'lost',
        req.user.sub,
        contact_email || null,
        contact_phone || null,
        embeddingStr // ✅ Correct format
      ]
    );

    const item = r.rows[0]
    // Fire-and-forget email to reporter when a lost item is created (if email provided)
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

//smart items search
app.get('/items/similar', async (req, res) => {
  const { queryText, status } = req.query;
  if (!queryText) return res.status(400).json({ error: 'queryText is required' });

  try {
    // 1️⃣ Generate embedding for the query
    const queryEmbedding = await getEmbedding(queryText);
    const queryEmbeddingStr = `[${queryEmbedding.join(',')}]`;

    // 2️⃣ Base query
    let sql = `
      SELECT 
        id, title, description, location, category, status, 
        contact_email, contact_phone,
        1 - (embedding <#> $1::vector) AS similarity
      FROM items
      WHERE (1 - (embedding <#> $1::vector)) > 0.7
    `;

    const params = [queryEmbeddingStr];

    // 3️⃣ Optional status filter
    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }

    // 4️⃣ Order and limit
    sql += ' ORDER BY similarity DESC LIMIT 5;';

    // 5️⃣ Execute query
    const r = await pool.query(sql, params);

    // 6️⃣ Handle no matchess
    if (r.rows.length === 0) {
      return res.json({ message: "No similar items found", items: [] });
    }

    res.json({ items: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find similar items' });
  }
});

init().then(() => {
  app.listen(PORT, () => {
    console.log(`items-service listening on ${PORT}`)
  })
})

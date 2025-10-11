import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))

const PORT = process.env.PORT || 8080
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001'
const ITEMS_SERVICE_URL = process.env.ITEMS_SERVICE_URL || 'http://localhost:4002'

app.get('/health', (req, res) => {
  //comment added
  res.json({ status: 'ok', service: 'api-gateway' })
})

app.post('/auth/register', async (req, res) => {
  try {
    const r = await axios.post(`${AUTH_SERVICE_URL}/register`, req.body)
    res.status(r.status).json(r.data)
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data)
    res.status(500).json({ error: 'auth register failed' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const r = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body)
    res.status(r.status).json(r.data)
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data)
    res.status(500).json({ error: 'auth login failed' })
  }
})

app.get('/auth/verify', async (req, res) => {
  try {
    const headers = {}
    if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization']
    const r = await axios.get(`${AUTH_SERVICE_URL}/verify`, { headers })
    res.status(r.status).json(r.data)
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data)
    res.status(500).json({ error: 'auth verify failed' })
  }
})

function extractToken(req) {
  const header = req.headers['authorization'] || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

app.get('/items', async (req, res) => {
  try {
    const r = await axios.get(`${ITEMS_SERVICE_URL}/items`, { params: req.query })
    res.status(r.status).json(r.data)
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data)
    res.status(500).json({ error: 'items list failed' })
  }
})

app.post('/items', async (req, res) => {
  try {
    const token = extractToken(req)
    const r = await axios.post(`${ITEMS_SERVICE_URL}/items`, req.body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    res.status(r.status).json(r.data)
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data)
    res.status(500).json({ error: 'items create failed' })
  }
})

app.post('/items/:id/found', async (req, res) => {
  try {
    const token = extractToken(req)
    const r = await axios.post(`${ITEMS_SERVICE_URL}/items/${req.params.id}/found`, req.body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    res.status(r.status).json(r.data)
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data)
    res.status(500).json({ error: 'items mark found failed' })
  }
})

app.listen(PORT, () => {
  console.log(`api-gateway listening on ${PORT}`)
})



import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import os from 'os'
import FormData from 'form-data'

dotenv.config()


const app = express()
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001
const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_USERS_DB_ID = process.env.NOTION_USERS_DB_ID

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb' }))

const notionAPI = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
})

// Relation page IDs dari Notion databases
const departemenMap = {
  'DEPT. PRODUCTION MANAGER':  '37295d6f-4985-80c9-80d1-e60644526715',
  'DEPT. ART LEAD':            'a5695d6f-4985-8325-ae2f-01a300770824',
  'BPH':                       '51595d6f-4985-828f-bf66-01e947eaac5d',
  'DEPT. EVENT ORGANIZER':     '8e195d6f-4985-8205-b3cd-81ea2c1e7026',
  'DEPT. SOCIAL MEDIA':        '44795d6f-4985-8398-8775-81671d06bbf1',
  'DEPT. PUBLIC RELATION':     'acd95d6f-4985-82ae-b560-01f2739f45c9',
}

const divisiMap = {
  'SEKRETARIS':          '37995d6f-4985-80c5-9ea6-f63fd2824912',
  'BENDAHARA':           '37995d6f-4985-801d-9355-d64de3477203',
  'KETUA & WAKIL KETUA': '37995d6f-4985-80c8-9e57-d022cbe21f10',
  'EVENT SECURITY':      '37295d6f-4985-802e-a9c0-ce9ffd65044c',
  'EQUIPMENT':           '37295d6f-4985-8056-ae40-dbcdb2933a95',
  'ADMIN':               '37295d6f-4985-802e-821b-ca07121e6c87',
  'CONTENT CREATOR':     '37295d6f-4985-8089-ac34-d2afcb2741d4',
  'COPYWRITING':         '37295d6f-4985-8045-aadc-ec8cb18df304',
  'CONTENT PLANNING':    '37295d6f-4985-8054-88d7-e0ed5783d0fe',
  'SPONSORSHIP':         '37295d6f-4985-8027-b7ac-c69ea67ed224',
  'OFFLINE PUBLICATION': '37295d6f-4985-80ae-933e-e9f1f86f6165',
  'LIAISON OFFICER':     '37295d6f-4985-8004-9216-f2f797aaef0a',
  'SALES & COMMERCE':    '37295d6f-4985-8056-8be6-e4dd19c457e7',
  'MEDIA PARTNER':       '37295d6f-4985-8069-8ede-c14c5c2381ed',
  'CURATIONAL':          '37295d6f-4985-8019-8f4e-ef817703f266',
  'EXHIBITION DISPLAY':  '37295d6f-4985-8089-ac6d-ec59b84ab92a',
  'CONSUMPTION':         '37295d6f-4985-80b4-9025-ee340dd6b49e',
  'EVENT MANAGEMENT':    '37295d6f-4985-8083-a368-f9eef9e701e6',
  'WEBSITE':             '37295d6f-4985-8022-a350-fa2bbff34f87',
  'CINEMATOGRAPHY':      '37295d6f-4985-8048-9f32-cb290509e3e5',
  'ART DESIGN':          '37295d6f-4985-808b-9676-c26388353e3c',
  'DECORATION':          '38095d6f-4985-8069-bd90-f533f8c601a5',
}

const departemenDivisiMap = {
  'BPH':                      ['KETUA & WAKIL KETUA', 'SEKRETARIS', 'BENDAHARA'],
  'DEPT. ART LEAD':           ['ART DESIGN', 'CINEMATOGRAPHY', 'WEBSITE'],
  'DEPT. PUBLIC RELATION':    ['SPONSORSHIP', 'MEDIA PARTNER', 'SALES & COMMERCE', 'LIAISON OFFICER', 'OFFLINE PUBLICATION'],
  'DEPT. PRODUCTION MANAGER': ['EQUIPMENT', 'EVENT SECURITY', 'DECORATION'],
  'DEPT. SOCIAL MEDIA':       ['CONTENT CREATOR', 'COPYWRITING', 'ADMIN', 'CONTENT PLANNING'],
  'DEPT. EVENT ORGANIZER':    ['CONSUMPTION', 'EVENT MANAGEMENT', 'EXHIBITION DISPLAY', 'CURATIONAL'],
}

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const response = await notionAPI.post(`/databases/${NOTION_USERS_DB_ID}/query`, {
      filter: { and: [
        { property: 'Username', rich_text: { equals: username } },
        { property: 'Password', rich_text: { equals: password } },
      ]},
    })
    const user = response.data.results[0]
    if (!user) return res.status(401).json({ error: 'Username atau password salah' })
    const nama = user.properties.Name.title[0]?.plain_text || username
    res.json({ ok: true, user: { username, nama } })
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message })
  }
})

app.post('/api/register', async (req, res) => {
  try {
    const { nama, username, password } = req.body
    if (!nama || !username || !password) return res.status(400).json({ error: 'Semua field wajib diisi' })

    // Cek username sudah ada
    const check = await notionAPI.post(`/databases/${NOTION_USERS_DB_ID}/query`, {
      filter: { property: 'Username', rich_text: { equals: username } },
    })
    if (check.data.results.length > 0) return res.status(400).json({ error: 'Username sudah dipakai' })

    await notionAPI.post('/pages', {
      parent: { database_id: NOTION_USERS_DB_ID },
      properties: {
        'Name':     { title: [{ text: { content: nama } }] },
        'Username': { rich_text: [{ text: { content: username } }] },
        'Password': { rich_text: [{ text: { content: password } }] },
      },
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server berjalan dengan baik' })
})

app.get('/api/options', (req, res) => {
  res.json({
    ok: true,
    departemen: Object.keys(departemenMap),
    divisi: Object.keys(divisiMap),
    departemenDivisiMap,
  })
})

async function uploadImage(base64) {
  const matches = base64.match(/^data:(.+);base64,(.+)$/)
  if (!matches) throw new Error('Invalid base64 image')
  const imageData = matches[2]

  const params = new URLSearchParams()
  params.append('key', process.env.IMGBB_API_KEY)
  params.append('image', imageData)

  const res = await axios.post('https://api.imgbb.com/1/upload', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 30000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })

  const url = res.data?.data?.url
  if (!url) throw new Error('ImgBB upload gagal')
  return url
}

app.post('/api/expense', async (req, res) => {
  try {
    const { departemen, divisi, pic, expense, amount, photoBase64, pembuat, pakaiUangPribadi, bank, rekening } = req.body

    if (!departemen || !divisi || !pic || !expense || !amount) {
      return res.status(400).json({ error: 'Field wajib: departemen, divisi, pic, expense, amount' })
    }

    const departemenId = departemenMap[departemen]
    const divisiId = divisiMap[divisi]

    if (!departemenId) return res.status(400).json({ error: `Departemen tidak valid: ${departemen}` })
    if (!divisiId) return res.status(400).json({ error: `Divisi tidak valid: ${divisi}` })

    const now = new Date().toISOString()

    const properties = {
      'Expense Record': { title: [{ text: { content: expense } }] },
      'Departemen': { relation: [{ id: departemenId }] },
      'Expense Divisi': { relation: [{ id: divisiId }] },
      'PIC': { rich_text: [{ text: { content: pic } }] },
      'Amount': { number: parseInt(amount) },
      'Date': { date: { start: now } },
      'Reimburse': { status: { name: pakaiUangPribadi ? 'Reimburse' : 'No Reimburse' } },
      ...(pembuat ? { 'Pembuat': { rich_text: [{ text: { content: pembuat } }] } } : {}),
      ...(bank ? { 'Bank': { rich_text: [{ text: { content: bank } }] } } : {}),
      ...(rekening ? { 'Rekening': { rich_text: [{ text: { content: rekening } }] } } : {}),
    }

    if (photoBase64) {
      const photoUrl = await uploadImage(photoBase64)
      properties['Nota'] = { files: [{ name: 'Nota', type: 'external', external: { url: photoUrl } }] }
    }

    const createResponse = await notionAPI.post('/pages', {
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
    })

    res.json({
      ok: true,
      message: 'Expense berhasil disimpan ke Notion',
      pageId: createResponse.data.id,
    })
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data,
    })
  }
})

// Get local IP untuk akses dari HP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Server berjalan:`)
  console.log(`  └─ http://localhost:${PORT} (Desktop)`)
  console.log(`  └─ http://${localIP}:${PORT} (HP/Device lain)`)
  console.log(`✓ Database: ${NOTION_DATABASE_ID}`)
  console.log(`✓ CORS enabled\n`)
})

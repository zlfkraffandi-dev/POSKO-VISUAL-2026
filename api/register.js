import axios from 'axios'

const notionAPI = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { nama, username, password } = req.body
    if (!nama || !username || !password) return res.status(400).json({ error: 'Semua field wajib diisi' })

    const check = await notionAPI.post(`/databases/${process.env.NOTION_USERS_DB_ID}/query`, {
      filter: { property: 'Username', rich_text: { equals: username } },
    })
    if (check.data.results.length > 0) return res.status(400).json({ error: 'Username sudah dipakai' })

    await notionAPI.post('/pages', {
      parent: { database_id: process.env.NOTION_USERS_DB_ID },
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
}

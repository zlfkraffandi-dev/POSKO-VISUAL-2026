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
    const { username, password } = req.body
    const response = await notionAPI.post(`/databases/${process.env.NOTION_USERS_DB_ID}/query`, {
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
}

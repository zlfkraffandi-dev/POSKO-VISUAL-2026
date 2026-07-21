import axios from 'axios'

const notionAPI = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
})

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

async function uploadImage(base64) {
  const matches = base64.match(/^data:(.+);base64,(.+)$/)
  if (!matches) throw new Error('Invalid base64 image')

  const params = new URLSearchParams()
  params.append('key', process.env.IMGBB_API_KEY)
  params.append('image', matches[2])

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { departemen, divisi, pic, expense, amount, photoBase64, pembuat, pakaiUangPribadi, bank, rekening } = req.body

    if (!departemen || !divisi || !pic || !expense || !amount) {
      return res.status(400).json({ error: 'Field wajib: departemen, divisi, pic, expense, amount' })
    }

    const departemenId = departemenMap[departemen]
    const divisiId = divisiMap[divisi]

    if (!departemenId) return res.status(400).json({ error: `Departemen tidak valid: ${departemen}` })
    if (!divisiId) return res.status(400).json({ error: `Divisi tidak valid: ${divisi}` })

    const properties = {
      'Expense Record': { title: [{ text: { content: expense } }] },
      'Departemen':     { relation: [{ id: departemenId }] },
      'Expense Divisi': { relation: [{ id: divisiId }] },
      'PIC':            { rich_text: [{ text: { content: pic } }] },
      'Amount':         { number: parseInt(amount) },
      'Date':           { date: { start: new Date().toISOString() } },
      'Reimburse':      { status: { name: pakaiUangPribadi ? 'Reimburse' : 'No Reimburse' } },
      ...(pembuat  ? { 'Pembuat':  { rich_text: [{ text: { content: pembuat } }] } } : {}),
      ...(bank     ? { 'Bank':     { rich_text: [{ text: { content: bank } }] } } : {}),
      ...(rekening ? { 'Rekening': { rich_text: [{ text: { content: rekening } }] } } : {}),
    }

    if (photoBase64) {
      const photoUrl = await uploadImage(photoBase64)
      properties['Nota'] = { files: [{ name: 'Nota', type: 'external', external: { url: photoUrl } }] }
    }

    const createResponse = await notionAPI.post('/pages', {
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties,
    })

    res.json({ ok: true, message: 'Expense berhasil disimpan ke Notion', pageId: createResponse.data.id })
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
    res.status(500).json({ error: error.response?.data?.message || error.message, details: error.response?.data })
  }
}

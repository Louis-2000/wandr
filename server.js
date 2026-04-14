import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/places', async (req, res) => {
  const { query } = req.query
  if (!query) return res.status(400).json({ error: 'Query required' })

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_PLACES_KEY}`
    )
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch places' })
  }
})

const PORT = process.env.PORT || 3001
app.get('/api/autocomplete', async (req, res) => {
  const { input } = req.query
  if (!input) return res.status(400).json({ error: 'Input required' })

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${process.env.GOOGLE_PLACES_KEY}`
    )
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' })
  }
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
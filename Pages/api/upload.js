import formidable from 'formidable'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

// disable bodyParser to let formidable handle it
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to process file.' })
    }

    const filePath = files.file[0].filepath
    const fileContent = readFileSync(filePath)
    const records = parse(fileContent, { columns: true })

    // ... your logic to map and transform rows ...

    const output = [
      Object.keys(records[0]).join(','), // headers
      ...records.map((row) => Object.values(row).join(',')), // rows
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="mapped.csv"')
    res.status(200).send(output)
  })
}

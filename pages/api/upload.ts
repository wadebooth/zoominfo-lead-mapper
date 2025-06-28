import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Files, Fields } from 'formidable'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { mapRow, convertToCSV } from '../../utils/transform'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const form = new IncomingForm({ multiples: false })

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error('Error parsing form:', err)
      return res.status(500).json({ error: 'File parsing failed' })
    }

    try {
      const fileArray = Array.isArray(files.file) ? files.file : [files.file]
      const file = fileArray[0]

      if (!file?.filepath) {
        return res.status(400).json({ error: 'No file received' })
      }

      const content = readFileSync(file.filepath, 'utf8')
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
      })

      if (!records.length) {
        return res.status(400).json({ error: 'CSV is empty or invalid' })
      }

      const mapped = records.map(mapRow)
      const csv = convertToCSV(mapped)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="mapped.csv"')
      res.status(200).send(csv)
    } catch (e) {
      console.error('Unhandled processing error:', e)
      res.status(500).json({ error: 'Processing failed' })
    }
  })
}

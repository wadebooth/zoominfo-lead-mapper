import { IncomingForm, File } from 'formidable'
import { parse as csvParse } from 'csv-parse/sync'
import { mapRow, convertToCSV } from '../../utils/transform'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    multiples: false,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err)
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const uploaded = files.file
    const file: File | undefined = Array.isArray(uploaded)
      ? uploaded[0]
      : uploaded

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'Invalid or missing file' })
    }

    try {
      const fileBuffer = await fs.promises.readFile(file.filepath)
      const records = csvParse(fileBuffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      })

      const mapped = records.map(mapRow)
      const csv = convertToCSV(mapped)

      res.setHeader('Content-Disposition', 'attachment; filename="mapped.csv"')
      res.setHeader('Content-Type', 'text/csv')
      res.status(200).send(csv)
    } catch (e) {
      console.error('Processing failed:', e)
      res.status(500).json({ error: 'Failed to process CSV file' })
    }
  })
}

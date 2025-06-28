import { IncomingForm } from 'formidable'
import type formidable from 'formidable'

import fs from 'fs'
import path from 'path'
import { mapRow, convertToCSV } from '../../utils/transform'

import { parse as csvParse } from 'csv-parse'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

function parseCSV(filePath: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const records: Record<string, string>[] = []
    fs.createReadStream(filePath)
      .pipe(csvParse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err))
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const form = new IncomingForm({ keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing file' })
      return
    }

    const rawFile = files.file
    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile

    if (!file || !('filepath' in file)) {
      res.status(400).json({ error: 'Missing file or invalid format' })
      return
    }

    try {
      const records = await parseCSV(file.filepath)
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

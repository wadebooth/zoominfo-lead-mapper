import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files, File as FormidableFile } from 'formidable'
import { parse as csvParse } from 'csv-parse/sync'
import { mapRow, convertToCSV } from '../../utils/transform'
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
  try {
    const { files } = await new Promise<{ fields: Fields; files: Files }>(
      (resolve, reject) =>
        new IncomingForm({
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024,
          multiples: false,
        }).parse(req, (err, fields, files) => {
          if (err) return reject(err)
          resolve({ fields, files })
        })
    )

    const uploaded = files.file as FormidableFile | FormidableFile[] | undefined
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded

    if (!file?.filepath) {
      console.error('No file or filepath found:', files)
      return res.status(400).json({ error: 'Invalid or missing file upload' })
    }

    const raw = await fs.promises.readFile(file.filepath)
    let records: any[]
    try {
      records = csvParse(raw.toString(), {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        quote: '',
      })
    } catch (parseErr) {
      console.error('CSV parse error:', parseErr)
      return res.status(422).json({
        error: 'Unable to parse CSV',
        details: (parseErr as Error).message,
      })
    }

    const mapped = records.map(mapRow)
    const outCsv = convertToCSV(mapped)

    res.setHeader('Content-Disposition', 'attachment; filename="mapped.csv"')
    res.setHeader('Content-Type', 'text/csv')
    return res.status(200).send(outCsv)
  } catch (err) {
    console.error('Unexpected handler error:', err)
    return res
      .status(500)
      .json({ error: 'Internal server error', details: (err as Error).message })
  }
}

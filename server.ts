import fs from 'fs'
import csv from 'csv-parser'
import express from 'express'
import multer from 'multer'
import { mapRow, convertToCSV, HEADERS } from './transform'
import type { Request, Response } from 'express'

const upload = multer({ dest: 'uploads/' })
const app = express()
const PORT = 3000

app.use(express.static('public'))

app.post(
  '/upload',
  upload.single('file'),
  (req: Request, res: Response): void => {
    const inputPath = req.file?.path
    const results: Record<string, string>[] = []

    if (!inputPath) {
      res.status(400).send('No file uploaded.')
      return
    }

    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (data) => results.push(mapRow(data)))
      .on('end', () => {
        const csvOutput = convertToCSV(results)
        fs.writeFileSync('./output.csv', csvOutput)
        res.download('./output.csv')
      })
  }
)
app.listen(PORT, () =>
  console.log(`✔ Server running on http://localhost:${PORT}`)
)

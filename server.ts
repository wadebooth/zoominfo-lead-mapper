import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import express from 'express'
import multer from 'multer'
import { mapRow, convertToCSV } from './utils/transform'
import type { Request, Response } from 'express'

const upload = multer({ dest: 'uploads/' })
const app = express()
const PORT = 3000

app.use(express.static('public'))

app.post(
  '/api/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file || !req.file.path) {
      res.status(400).send('No file uploaded.')
      return
    }

    const inputPath = req.file.path
    const results: Record<string, string>[] = []

    if (!req.file.originalname.endsWith('.csv')) {
      fs.unlinkSync(inputPath)
      res.status(400).send('Only CSV files are allowed.')
      return
    }

    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (data) => results.push(mapRow(data)))
      .on('end', () => {
        if (results.length === 0) {
          fs.unlinkSync(inputPath)
          res
            .status(400)
            .send('The uploaded CSV is empty or contains no usable rows.')
          return
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const outputFile = `output-${timestamp}.csv`

        const csvOutput = convertToCSV(results)
        fs.writeFileSync(outputFile, csvOutput)
        res.download(outputFile, () => {
          fs.unlinkSync(inputPath)
          fs.unlinkSync(outputFile)
        })
      })
  }
)

app.listen(PORT, () => {
  console.log(`✔ Server running on http://localhost:${PORT}`)
})

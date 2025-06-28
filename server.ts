import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import express from 'express'
import multer from 'multer'
import { mapRow, convertToCSV } from './transform'
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
        const timestamp = new Date().toISOString().split('T')[0] // e.g., 2025-06-26
        const outputFilename = `mapped-zoominfo-leads-${timestamp}.csv`
        const outputPath = path.join(__dirname, outputFilename)

        fs.writeFileSync(outputPath, convertToCSV(results))

        res.download(outputPath, outputFilename, (err) => {
          // Cleanup temp files after download
          fs.unlinkSync(inputPath)
          fs.unlinkSync(outputPath)
          if (err) {
            console.error('Error sending file:', err)
          }
        })
      })
  }
)

app.listen(PORT, () => {
  console.log(`✔ Server running on http://localhost:${PORT}`)
})

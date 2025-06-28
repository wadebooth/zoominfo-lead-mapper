const formidable = require('formidable')
const { readFileSync } = require('fs')
const { parse } = require('csv-parse/sync')

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

    // logic to generate output...

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="mapped.csv"')
    res.status(200).send(output)
  })
}

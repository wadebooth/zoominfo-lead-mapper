import React, { useState } from 'react'
import Head from 'next/head'

export default function HomePage() {
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    const fileInput = document.getElementById('csvFile') as HTMLInputElement
    const file = fileInput.files?.[0]

    if (!file) {
      setErrorMessage('Please select a CSV file before uploading.')
      return
    } else {
      setErrorMessage('')
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        alert('Failed to convert file.')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'crm-ready-leads.tsv'
      a.click()
      window.URL.revokeObjectURL(url)
      fileInput.value = ''
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Head>
        <title>ZoomInfo Lead Mapper</title>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='icon' href='/favicon.png' type='image/png' />
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 4rem;
            background-color: #f9f9f9;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .upload-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            gap: 1rem;
            width: 100%;
            max-width: 400px;
          }
          input[type='file'] {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 6px;
          }
          button {
            position: relative;
            padding: 0.75rem;
            background-color: #007bff;
            border: none;
            color: white;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          button:disabled {
            opacity: 0.6;
            cursor: default;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin-left: 0.5rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .footer {
            margin-top: 2rem;
            font-size: 0.85rem;
            color: #666;
            text-align: center;
            max-width: 500px;
            line-height: 1.4;
          }
          .github-link {
            margin-top: 0.5rem;
            font-size: 0.85rem;
          }
          #error-message {
            color: red;
            font-size: 0.9rem;
            text-align: center;
          }
        `}</style>
      </Head>

      <h1>ZoomInfo → CRM Upload Form Mapper</h1>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Things to Keep in Mind
        </h2>
        <ul
          style={{
            marginTop: '0.5rem',
            paddingLeft: '1.25rem',
            lineHeight: '1.6',
          }}
        >
          <li>
            <strong>Step 1:</strong> Export your full ZoomInfo list to Excel,
            then “Save As” CSV. No need to delete or rearrange any columns.
          </li>
          <li>
            <strong>Step 2:</strong> Click <code>Choose File</code> below and
            select your newly saved CSV.
          </li>
          <li>
            <strong>Step 3:</strong> Hit the blue button. When it finishes, your
            mapped file will download automatically.
            <br />
            <em>Tip:</em> To paste straight into the lead list upload excel,
            click cell A2, press <code>Shift + ⌘ + →</code> until every field to
            column AN is highlighted, then <code>Shift + ⌘ + ↓</code> to select
            all rows of leads, then <code>⌘ + C</code> or copy. Switch to shared
            Excel for upload, select the first empty cell in column A, and use{' '}
            <code>⌘ + V</code> or paste.
          </li>
          <li>
            <strong>Job Role & Function:</strong> Blank or unrecognized titles
            default to <em>"Other"</em>. If your data is missing key info,
            you’ll see empty fields—so double-check before importing.
          </li>
          <li>
            <strong>Assigned To:</strong> Defaults to{' '}
            <code>your.name@email.com</code>. Be sure to replace it with your
            own address. Happy converting!
          </li>
        </ul>
      </section>

      <div className='upload-section'>
        <input id='csvFile' type='file' accept='.csv' />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Processing' : 'Upload & Convert'}
          {loading && <div className='spinner' />}
        </button>
        {errorMessage && <p id='error-message'>{errorMessage}</p>}
      </div>

      <div className='footer'>
        <p>
          NOTE: This tool does not upload or store any data. Everything is
          processed directly in your browser using what's called client-side
          processing. This tool is an open-source personal project, and isn't
          affiliated with any specific company. Built by Wade Booth.
        </p>
        <p className='github-link'>
          <a
            href='https://github.com/wadebooth/zoominfo-lead-mapper'
            target='_blank'
            rel='noopener noreferrer'
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}

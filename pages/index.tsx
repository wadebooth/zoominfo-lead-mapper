import React, { useState } from 'react'
import Head from 'next/head'

export default function HomePage() {
  const [errorMessage, setErrorMessage] = useState('')

  const handleUpload = async () => {
    const fileInput = document.getElementById('csvFile') as HTMLInputElement
    const file = fileInput.files?.[0]

    if (!file) {
      setErrorMessage('Please select a CSV file before uploading.')
      return
    } else {
      setErrorMessage('')
    }

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
    a.download = 'mapped.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    fileInput.value = ''
  }

  return (
    <div>
      <Head>
        <title>ZoomInfo Lead Mapper</title>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
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
            padding: 0.75rem;
            background-color: #007bff;
            border: none;
            color: white;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
          .footer {
            margin-top: 2rem;
            font-size: 0.85rem;
            color: #666;
            text-align: center;
            max-width: 500px;
            line-height: 1.4;
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
            <strong>Step 1:</strong> Export your ZoomInfo list as a CSV only.
          </li>
          <li>
            <strong>Step 2:</strong> Upload the file using the{' '}
            <code>Choose File</code> button below.
          </li>
          <li>
            <strong>Step 3:</strong> After conversion, download the mapped CSV
            file by clicking the blue button.
            <br />
            <em>Tip:</em> Click cell A2, then press <code>Shift + Cmd + →</code>{' '}
            followed by <code>Shift + Cmd + ↓</code> to highlight all data. Use{' '}
            <code>Cmd + C</code> to copy, then paste into the first open row
            under column A using <code>Cmd + V</code>.
          </li>
          <li>
            <strong>Job Role & Function:</strong> If fields are blank or
            mismatched, it will default to <em>"Other"</em>.
          </li>
          <li>
            <strong>Assigned To:</strong> Output defaults to{' '}
            <code>your.name@email.com</code>. Replace with your email.
          </li>
        </ul>
      </section>

      <div className='upload-section'>
        <input id='csvFile' type='file' accept='.csv' required />
        <button onClick={handleUpload}>Upload & Convert</button>
        {errorMessage && <p id='error-message'>{errorMessage}</p>}
      </div>

      <div className='footer'>
        <p>
          NOTE: This tool does not upload or store any data. Everything is
          processed directly in your browser using what's called client-side
          processing. This tool is an open-source personal project, and isn't
          affiliated with any specific company. Built by Wade Booth.
        </p>
      </div>
    </div>
  )
}

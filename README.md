ZoomInfo Lead Mapper
ZoomInfo Lead Mapper is a lightweight web-based tool designed to convert ZoomInfo CSV exports into a CRM-ready lead upload format. It supports automatic normalization of data fields such as state and country abbreviations, phone formatting, deduplication of business vs. mobile numbers, and auto-generates campaign-specific metadata.

🚀 Features
📁 Upload a ZoomInfo CSV file directly from the browser

🧠 Automatically maps and cleans contact fields

☎️ Removes duplicate phone numbers (e.g., if mobile = direct)

📍 Converts full state/country names into abbreviations

📦 Outputs a CRM-ready CSV file with predefined headers

🔒 No third-party services or data storage

🌐 Ready for deployment to Firebase, Vercel, or similar

🛠️ Stack
Frontend: HTML + Express static server

Backend: Node.js (Express + Multer + csv-parser)

Transforms: Modular TypeScript logic (transform.ts)

Output: Uses json2csv for CRM-compatible CSV exports

📦 Installation
bash
Copy
Edit
git clone https://github.com/wadebooth/zoominfo-lead-mapper.git
cd zoominfo-lead-mapper
npm install
🧪 Run Locally
bash
Copy
Edit
npx ts-node server.ts
Visit http://localhost:3000 and upload your ZoomInfo CSV.

📁 File Structure
graphql
Copy
Edit
zoominfo-lead-mapper/
├── public/               # Frontend upload form (HTML/CSS)
├── uploads/              # Temporary CSV upload storage
├── transform.ts          # Mapping and formatting logic
├── server.ts             # Express server
└── README.md
📤 Deployment
You can deploy to any platform that supports Node.js:

Firebase Hosting + Cloud Functions (suggested)
Set up Firebase project

Use Firebase Functions to run server.ts logic

Host the frontend via Firebase Hosting

Set up rewrites to proxy /upload to the function

Alternatively, deploy via:

Vercel

Render

Railway

Glitch

🧠 Future Ideas
Drag-and-drop support

Support for Google Sheets uploads

Field mapping customization

Email notifications when file is ready

🙌 Contributing
Pull requests are welcome! Please open an issue first to discuss any major changes.


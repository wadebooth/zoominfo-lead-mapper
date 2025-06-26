import fs from 'fs'
import csv from 'csv-parser'
// @ts-ignore
const { parse } = require('json2csv')

const INPUT_FILE = './input.csv' // Rename your actual ZoomInfo export to this
const OUTPUT_FILE = './output_crm_upload.csv'
const ASSIGNED_TO = 'your.email@servicenow.com' // Change this to your email

const STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',

  // Canadian Provinces
  Alberta: 'AB',
  'British Columbia': 'BC',
  Manitoba: 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Northwest Territories': 'NT',
  'Nova Scotia': 'NS',
  Nunavut: 'NU',
  Ontario: 'ON',
  'Prince Edward Island': 'PE',
  Quebec: 'QC',
  Saskatchewan: 'SK',
  Yukon: 'YT',
}

const COUNTRY_ABBREVIATIONS: Record<string, string> = {
  'United States': 'US',
  Canada: 'CA',
}

function cleanPhone(phone: string): string {
  return phone?.replace(/[^0-9]/g, '') || ''
}

function getListSource(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const year = now.getFullYear().toString().slice(-2)
  return `Import-Zoominfo-WestOutbound-${day}${month}${year}`
}

const HEADERS = [
  'First Name',
  'Last Name',
  'Title',
  'Job Level',
  'Job Role',
  'Job Function',
  'Email Address',
  'Address',
  'Business Phone',
  'Mobile Phone',
  'Company',
  'Address 1',
  'Address 2',
  'City',
  'State or Province',
  'Country',
  'Zip or Postal Code',
  'Lead Source Recent',
  'Member Status',
  'ExplicitConsentDate',
  'ExplicitConsentSource',
  'Assigned To',
  'Hot Lead',
  'Campaign Asset',
  'Comments',
  'Salutation',
  'List Source (required for OL campaigns)',
  'Solution Interest',
  'Requested Next Step',
  'Account Number',
  'Campaign ID',
  'List Upload Name',
  'I am Interested',
  'Conditional fields >>>',
  'Unsubscribed',
  'Unsubscribed Date',
  'Unsubscribed Reason',
  'Special Instructions',
  'Marketing Suspended',
  'Marketing Suspended Reason',
  'Process Rule',
]

function mapRow(row: Record<string, string>): Record<string, string> {
  function fallback(...values: (string | undefined)[]): string {
    for (const v of values) {
      if (v && v.trim()) return v.trim()
    }
    return ''
  }

  const stateRaw = fallback(
    row['Company State'],
    row['Person State'],
    row['State'],
    row['State/Province'],
    row['Contact State']
  )

  const stateAbbrev = STATE_ABBREVIATIONS[stateRaw] || stateRaw

  const countryRaw = fallback(row['Company Country'], row['Country'])
  const countryAbbrev = COUNTRY_ABBREVIATIONS[countryRaw] || countryRaw

  return {
    'First Name': row['First Name'] || '',
    'Last Name': row['Last Name'] || '',
    Title: row['Job Title'] || '',
    'Job Level': row['Management Level'] || '',
    'Job Role': row['Department'] || '',
    'Job Function': row['Job Function'] || '',
    'Email Address': row['Email Address'] || row['Personal Email'] || '',
    Address: '',
    'Business Phone': cleanPhone(
      row['Direct Phone Number'] || row['Company HQ Phone'] || ''
    ),
    'Mobile Phone': cleanPhone(
      fallback(
        row['Mobile phone'],
        row['Mobile Phone'],
        row['Cell Phone'],
        row['Personal Mobile'],
        row['Mobile']
      )
    ),

    Company: row['Company Name'] || '',
    'Address 1': '',
    'Address 2': '',
    City: '',
    'State or Province': stateAbbrev,
    Country: countryAbbrev,
    'Zip or Postal Code': '',
    'Lead Source Recent': 'ADR Prospecting-IT-AMS West Sourced',
    'Member Status': '',
    ExplicitConsentDate: '',
    ExplicitConsentSource: '',
    'Assigned To': ASSIGNED_TO,
    'Hot Lead': '',
    'Campaign Asset': '',
    Comments: '',
    Salutation: '',
    'List Source (required for OL campaigns)': getListSource(),
    'Solution Interest': '',
    'Requested Next Step': '',
    'Account Number': '',
    'Campaign ID': '',
    'List Upload Name': '',
    'I am Interested': '',
    'Conditional fields >>>': '',
    Unsubscribed: '',
    'Unsubscribed Date': '',
    'Unsubscribed Reason': '',
    'Special Instructions': '',
    'Marketing Suspended': '',
    'Marketing Suspended Reason': '',
    'Process Rule': '',
  }
}

const results: Record<string, string>[] = []

fs.createReadStream(INPUT_FILE)
  .pipe(csv())
  .on('data', (data) => results.push(mapRow(data)))
  .on('end', () => {
    const csvOutput = parse(results, { fields: HEADERS })
    fs.writeFileSync(OUTPUT_FILE, csvOutput)
    console.log(`✔ Output saved to ${OUTPUT_FILE}`)
  })

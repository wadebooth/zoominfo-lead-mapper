// @ts-ignore
const { parse } = require('json2csv')

export const STATE_ABBREVIATIONS: Record<string, string> = {
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

export const COUNTRY_ABBREVIATIONS: Record<string, string> = {
  'United States': 'US',
  Canada: 'CA',
}

export function cleanPhone(phone: string): string {
  return phone?.replace(/[^0-9]/g, '') || ''
}

export function getListSource(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const year = now.getFullYear().toString().slice(-2)
  return `Import-Zoominfo-WestOutbound-${day}${month}${year}`
}

function fallback(...values: (string | undefined)[]): string {
  for (const v of values) {
    if (v && v.trim()) return v.trim()
  }
  return ''
}

const ASSIGNED_TO = 'your.email@servicenow.com' // Replace with your actual email

export function mapRow(row: Record<string, string>): Record<string, string> {
  const stateRaw = fallback(row['Company State'], row['Person State'])
  const stateAbbrev = STATE_ABBREVIATIONS[stateRaw] || stateRaw

  const countryRaw = fallback(row['Company Country'], row['Country'])
  const countryAbbrev = COUNTRY_ABBREVIATIONS[countryRaw] || countryRaw

  return {
    'First Name': row['First Name'] || '',
    'Last Name': row['Last Name'] || '',
    Title: row['Job Title'] || '',
    'Job Level': row['Management Level'] || 'Unknown',
    'Job Role': row['Department'] || 'Unknown',
    'Job Function': row['Job Function'] || 'Unknown',
    'Email Address': row['Email Address'] || row['Personal Email'] || '',
    'Business Phone': cleanPhone(
      row['Direct Phone Number'] || row['Company HQ Phone'] || ''
    ),
    'Mobile Phone': cleanPhone(row['Mobile phone'] || ''),
    Company: row['Company Name'] || '',
    'Address 1': '',
    'Address 2': '',
    City: fallback(row['Company City'], row['Person City']),
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
//test
export const HEADERS = [
  'First Name',
  'Last Name',
  'Title',
  'Job Level',
  'Job Role',
  'Job Function',
  'Email Address',
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

export function convertToCSV(data: Record<string, string>[]): string {
  return parse(data, { fields: HEADERS })
}

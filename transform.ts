// @ts-ignore
const { parse } = require('json2csv')
import mapping from './job-level-mapping.json'

/* --- Constants --- */

const ASSIGNED_TO = 'your.email@company.com'

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

const JOB_LEVEL_MAP: Record<string, string> = {
  'C-Level': 'C-Level',
  VP: 'Vice President',
  Director: 'Director/Sr',
  Manager: 'Manager/Sr',
  Staff: 'Individual Contributor',
  Entry: 'Individual Contributor',
  Partner: 'Other',
  Owner: 'Other',
  Board: 'Other',
  Other: 'Other',
}

function cleanPhone(phone: string): string {
  const digits = phone?.replace(/\D/g, '') || ''
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return ''
}

export function mapJobLevel(title: string): string {
  const lowerTitle = title?.toLowerCase() || ''
  for (const [level, keywords] of Object.entries(mapping)) {
    if (
      (keywords as string[]).some((keyword) => lowerTitle.includes(keyword))
    ) {
      return level
    }
  }
  return 'Other'
}

export function mapToJobLevel(rawLevel: string): string {
  const cleaned = rawLevel?.trim()
  return JOB_LEVEL_MAP[cleaned] || 'Other'
}

export function getListSource(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const year = now.getFullYear().toString().slice(-2)
  return `Import-Zoominfo-WestOutbound-${day}${month}${year}`
}

function fallback(...values: (string | undefined)[]): string {
  return values.find((v) => v?.trim())?.trim() || ''
}

export function mapRow(row: Record<string, string>): Record<string, string> {
  const state =
    STATE_ABBREVIATIONS[fallback(row['Company State'], row['Person State'])] ||
    ''
  const country =
    COUNTRY_ABBREVIATIONS[fallback(row['Company Country'], row['Country'])] ||
    ''

  const rawDirect =
    fallback(row['Direct Phone Number'], row['Company HQ Phone']) || ''
  const rawMobile = fallback(row['Mobile phone'], row['Mobile Phone']) || ''

  const cleanedDirect = cleanPhone(rawDirect)
  const cleanedMobile = cleanPhone(rawMobile)

  let businessPhone = ''
  let mobilePhone = ''

  if (cleanedDirect && cleanedDirect === cleanedMobile) {
    businessPhone = cleanedDirect
    mobilePhone = ''
  } else {
    businessPhone = cleanedDirect || cleanedMobile || '0000000000'
    mobilePhone =
      cleanedDirect && cleanedMobile && cleanedMobile !== cleanedDirect
        ? cleanedMobile
        : ''
  }

  const jobTitle = row['Job Title'] || ''
  const isCEO = jobTitle.toLowerCase().includes('ceo')

  const validJobRoles = [
    'Cloud Operations',
    'Customer Service/Support',
    'Facilities',
    'Field Service',
    'Finance/Accounting',
    'Global Business Services/Shared Services',
    'Governance, Risk and Compliance',
    'HR',
    'IT',
    'Legal',
    'Marketing',
    'Operations/Engineering/R&D',
    'Other',
    'Sales',
    'Security',
    'Supply Chain/Manufacturing',
  ]

  const mappedRole = row['Department'] || 'Other'
  const finalJobRole =
    !isCEO && !validJobRoles.includes(mappedRole) ? 'Other' : mappedRole

  return {
    'First Name': row['First Name'] || '',
    'Last Name': row['Last Name'] || '',
    Title: jobTitle,
    'Job Level': mapToJobLevel(row['Management Level']),
    'Job Role': finalJobRole,
    'Job Function': row['Job Function'] || 'Unknown',
    'Email Address': row['Email Address'] || row['Personal Email'] || '',
    'Business Phone': businessPhone,
    'Mobile Phone': mobilePhone,
    Company: row['Company Name'] || '',
    'Address 1': '',
    'Address 2': '',
    City: fallback(row['Company City'], row['Person City']),
    'State or Province': state,
    Country: country,
    'Zip or Postal Code': fallback(
      row['Company Zip'],
      row['Person Zip'],
      row['Zip']
    ),
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

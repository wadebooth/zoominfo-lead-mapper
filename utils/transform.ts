import jobLevelMapping from '../job-level-mapping.json'

const ASSIGNED_TO = 'your.email@company.com'

const fallback = (...values: (string | undefined)[]) =>
  values.find((v) => v?.trim())?.trim() || ''

const cleanPhone = (phone: string) => {
  const digits = phone?.replace(/\D/g, '') || ''
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return ''
}

export const getListSource = () => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const year = now.getFullYear().toString().slice(-2)
  return `Import-Zoominfo-WestOutbound-${day}${month}${year}`
}

export const validJobRoles = [
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
  'CEO',
]

export const validCSuiteRoles = [
  'CAO',
  'CCO',
  'CDAO',
  'CDO',
  'CEO',
  'CFO',
  'CHRO',
  'CIO',
  'CISO/CSO',
  'CLO',
  'CMO',
  'COO',
  'CPO',
  'CRO',
  'CSCO',
  'CTO',
  'General Counsel',
  'CAIO',
]

const csuiteFunctionMap: Record<string, string> = {
  'chief accounting officer': 'CAO',
  'chief compliance officer': 'CCO',
  'chief commercial officer': 'CCO',
  'chief data & analytics officer': 'CDAO',
  'chief data officer': 'CDO',
  'chief digital officer': 'CDO',
  'chief executive officer': 'CEO',
  'chief financial officer': 'CFO',
  'chief human resources officer': 'CHRO',
  'chief information officer': 'CIO',
  'chief information security officer': 'CISO/CSO',
  'chief security officer': 'CISO/CSO',
  'chief legal officer': 'CLO',
  'chief learning officer': 'CLO',
  'chief marketing officer': 'CMO',
  'chief operating officer': 'COO',
  'chief product officer': 'CPO',
  'chief procurement officer': 'CPO',
  'chief revenue officer': 'CRO',
  'chief risk officer': 'CRO',
  'chief supply chain officer': 'CSCO',
  'chief technology officer': 'CTO',
  'general counsel': 'General Counsel',
  'chief ai officer': 'CAIO',
}

const csuiteRoleMap: Record<string, string> = {
  CAIO: 'IT',
  CAO: 'Finance/Accounting',
  CCO: 'Governance, Risk and Compliance',
  CDAO: 'IT',
  CDO: 'Customer Service/Support',
  CEO: 'CEO',
  CFO: 'Finance/Accounting',
  CHRO: 'HR',
  CIO: 'IT',
  'CISO/CSO': 'Security',
  CLO: 'Legal',
  CMO: 'Marketing',
  COO: 'Operations/Engineering/R&D',
  CPO: 'Supply Chain/Manufacturing',
  CRO: 'Sales',
  CSCO: 'Supply Chain/Manufacturing',
  CTO: 'IT',
  'General Counsel': 'Legal',
}

const mapJobLevel = (title = ''): string => {
  const lower = title.toLowerCase()
  for (const [level, keywords] of Object.entries(jobLevelMapping)) {
    if (
      Array.isArray(keywords) &&
      keywords.some((k: string) =>
        new RegExp(
          `\\b${k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
        ).test(lower)
      )
    ) {
      return level
    }
  }
  return 'Other'
}

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
}

const COUNTRY_ABBREVIATIONS: Record<string, string> = {
  'United States': 'US',
  Canada: 'CA',
}

export function mapRow(row: Record<string, string>): Record<string, string> {
  const normalize = (val = '') => val.trim().toUpperCase()
  const stateRaw = fallback(row['Company State'], row['Person State'])
  const state = STATE_ABBREVIATIONS[normalize(stateRaw)] || normalize(stateRaw)
  const countryRaw = fallback(row['Company Country'], row['Country'])
  const country =
    COUNTRY_ABBREVIATIONS[normalize(countryRaw)] || normalize(countryRaw)
  const jobTitle = row['Job Title'] || ''
  const upperTitle = jobTitle.toUpperCase()
  const department = row['Department']?.trim() || ''

  let finalJobFunction = 'Other'
  let finalJobRole = 'Other'
  const tokens = upperTitle
    .split(/[/,&|]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  const allCSuite = tokens.every((t) => validCSuiteRoles.includes(t))
  const anyCSuite = tokens.some((t) => validCSuiteRoles.includes(t))
  if (allCSuite) {
    const primary = tokens.find((t) => csuiteRoleMap[t])
    if (primary) {
      finalJobFunction = primary
      finalJobRole = csuiteRoleMap[primary]
    }
  } else if (anyCSuite) {
    finalJobFunction = 'Other'
    finalJobRole = 'Other'
  } else if (validJobRoles.includes(department)) {
    finalJobRole = department
    finalJobFunction = `${department} - Other`
  }

  const rawDirect = fallback(
    row['Direct Phone Number'],
    row['Company HQ Phone']
  )
  const rawMobile = fallback(row['Mobile phone'], row['Mobile Phone'])
  const cleanedDirect = cleanPhone(rawDirect)
  const cleanedMobile = cleanPhone(rawMobile)
  const businessPhone = cleanedDirect || cleanedMobile || '0000000000'
  const mobilePhone =
    cleanedDirect && cleanedMobile && cleanedDirect !== cleanedMobile
      ? cleanedMobile
      : ''

  return {
    'First Name': row['First Name'] || '',
    'Last Name': row['Last Name'] || '',
    Title: jobTitle,
    'Job Level': mapJobLevel(jobTitle),
    'Job Role': finalJobRole,
    'Job Function': finalJobFunction,
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

export const HEADERS: string[] = [
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

/**
 * Converts mapped data to a tab-delimited text (TSV) without any quotes.
 */
export function convertToCSV(data: Record<string, string>[]): string {
  const delimiter = '\t'
  const headerLine = HEADERS.join(delimiter)
  const lines = data.map((row) =>
    HEADERS.map((h) => row[h] ?? '').join(delimiter)
  )
  return [headerLine, ...lines].join('\n')
}

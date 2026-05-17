
export type UserRole = 'system_admin' | 'admin' | 'operator'
export type ReportStatus = 'Reported' | 'Dispatched' | 'Under Investigation' | 'Resolved'
export type DispatchStatus = 'Assigned' | 'On The Way' | 'Arrived' | 'Completed'
export type Sex = 'Male' | 'Female' | 'Other'


export interface SafeUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: UserRole
  barangay_id : number
  barangay_name : string
}
export interface Report {
  report_id: string
  report_status: ReportStatus
  reported_at: string
  age_days: number
  dispatch_count: number
  victim_name: string
  victim_contact: string | null
  offender_name: string | null
  offender_sex: Sex | null
  abuse_name: string
  severity: number
  severity_label: string
  barangay_name: string
  latitude: number | null
  longitude: number | null
  report_description: string | null
}

export interface ReportSummary{
  report_id: string
  victim_name: string
  barangay_name: string
  abuse_name: string
  severity: number
  report_status: ReportStatus
  reported_time: string
}

export interface Dispatch {
  dispatch_id: number
  dispatch_status: DispatchStatus
  dispatch_time: string
  remarks: string | null
  report_id: string
  report_status: ReportStatus
  barangay_name: string
  responder_id: number
  responder_name: string
  agency: string | null
  responder_contact: string | null
}

export interface Responder {
  responder_id: number
  responder_name: string
  agency: string | null
  contact_number: string | null
  total_dispatches: number
  completed_dispatches: number
}

export interface Barangay {
  id: number
  barangay_name: string
  latitude: number
  longitude: number
  radius: number
}

export interface AbuseType {
  abuse_name: string
  severity: number
  law_reference: string
  abuse_description: string | null
}

export interface Victim {
  victim_id: number
  first_name: string
  last_name: string
  contact_number: string | null
  email: string | null
  barangay_name: string | null
  address: string | null
}

export interface Offender {
  offender_id: number
  first_name: string
  sex: Sex | null
  barangay_name: string | null
}

export interface ReportNewPayload {
  report_id: string
  barangay_id: number
  abuse_name: string
  latitude: number
  longitude: number
  reported_at: string
}
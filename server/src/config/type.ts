import type { Request } from "express";

export type UserRole = "system_admin" | "admin" | "operator";

export interface JwtPayload {
  staff_id: number;
  user_role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface CreateStaff {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  user_role: UserRole;
  contact_number?: string;
}


export interface CreateBarangay {
  barangay_name: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// ─── Victim ──────────────────────────────────────────────────────────────────
export interface CreateVictim {
  first_name: string;
  last_name: string;
  contact_number?: string;
  email?: string;
  barangay_id?: number;
  address?: string;
}

// ─── Offender ────────────────────────────────────────────────────────────────
export interface CreateOffender {
  first_name: string;
  sex?: sex;
  barangay_id?: number;
}

export type sex = "Male" | "Female" | "Other";

// ─── Responder ───────────────────────────────────────────────────────────────
export interface CreateResponderBody {
  responder_name: string;
  agency?: string;
}

// ─── Abuse Type ──────────────────────────────────────────────────────────────
export interface CreateAbuseTypeBody {
  abuse_name: string;
  severity: number;
  law_reference: string;
}

// ─── Report ──────────────────────────────────────────────────────────────────
export type ReportStatus =
  | "Reported"
  | "Dispatched"
  | "Under Investigation"
  | "Resolved";

export interface CreateReport {
  victim_id: number;
  offender_id?: number;
  abuse_name: string;
  barangay_id: number;
  latitude: number;
  longitude: number;
  report_description: string;
}

export interface UpdateReportStatus {
  new_status: ReportStatus;
}

// ─── Dispatch ────────────────────────────────────────────────────────────────
export type DispatchStatus =
  | "Assigned"
  | "On The Way"
  | "On Scene"
  | "Completed";

export interface CreateDispatch {
  report_id: string;
  responder_id: number;
  remarks?: string;
}

export interface UpdateDispatchStatus {
  dispatch_status: DispatchStatus;
}

// ─── Resolved Report ─────────────────────────────────────────────────────────
export interface CreateResolvedReport {
  report_id: string;
  resolution_summary: string;
}

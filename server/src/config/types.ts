import type { Request } from "express";

export type UserRole = "system_admin" | "admin" | "operator";

export enum UserRoleEnum {
    SystemAdmin = "system_admin",
    Admin = "admin",
    Operator = "operator"
}

export function isUserRole(value : any): value is UserRole {
    return [
      "system_admin",
      "admin",
      "operator"
    ].includes(value);
}

export interface JwtUserPayload {
  staff_id: number;
  user_role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtUserPayload;
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

export interface Staff{
  id : number;
  email : string;
  full_name : string;
  role : UserRole;
  contact_number? : string;
}

export interface CreateBarangay {
  barangay_name: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface Barangay {
  id: number;
  barangay_name: string;
  latitude: number;
  longitude: number;
  radius: number;
}
export interface CreateVictim {
  first_name: string;
  last_name: string;
  contact_number?: string;
  email?: string;
  barangay_id?: number;
  address?: string;
}

export interface CreateOffender {
  first_name: string;
  sex?: sex;
  barangay_id?: number;
}

export type sex = "Male" | "Female" | "Other";

export interface CreateResponderBody {
  responder_name: string;
  agency?: string;
}

export interface CreateAbuseTypeBody {
  abuse_name: string;
  severity: number;
  law_reference: string;
}

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

export type DispatchStatus =
    "Assigned"
  | "On The Way"
  | "Arrived"
  | "Completed";

export interface CreateDispatch {
  report_id: string;
  responder_id: number;
  remarks?: string;
}

export interface Dispatch {
  dispatch_id: number;
  dispatch_status: DispatchStatus;
  dispatch_time: Date;
  remarks?: string;
  report_id: string;
  report_status: ReportStatus;
  barangay_name: string;
  responder_id: number;
  responder_name: string;
  agency?: string;
  responder_contact?: string;
}

export interface UpdateDispatchStatus {
  dispatch_status: DispatchStatus;
}

export interface CreateResolvedReport {
  report_id: string;
  resolution_summary: string;
}
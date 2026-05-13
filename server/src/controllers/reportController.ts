import type { Response } from "express";
import type { RowDataPacket } from "mysql2";
import type { AuthRequest, ReportStatus } from "../config/types.js";
import { getConn } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { getIo } from "../sockets/reportSockets.js";

const VALID_STATUSES: ReportStatus[] = ['Reported', 'Dispatched', 'Under Investigation', 'Resolved'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ReportRow extends RowDataPacket {
    report_id: string;
    report_status: ReportStatus;
    reported_at: Date;
    age_days: number;
    dispatch_count: number;
    victim_name: string;
    victim_contact: string | null;
    offender_name: string | null;
    offender_sex: string | null;
    abuse_name: string;
    severity: number;
    severity_label: string;
    barangay_name: string;
    latitude: number | null;
    longitude: number | null;
    report_description: string | null;
}

export const getAllReports = async (req: AuthRequest, res: Response) => {
    const { status, barangay_id, abuse_name } = req.query;

    if (status && !VALID_STATUSES.includes(status as ReportStatus)) {
        sendError(res, 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        return;
    }

    if (barangay_id && isNaN(Number(barangay_id))) {
        sendError(res, 400, 'Invalid barangay_id');
        return;
    }

    const conn = await getConn();
    let query = 'SELECT * FROM vw_report WHERE 1=1';
    const params: any[] = [];

    if (status) {
        query += ' AND report_status = ?';
        params.push(status);
    }

    if (barangay_id) {
        query += ' AND barangay_name = (SELECT barangay_name FROM barangay WHERE id = ?)';
        params.push(Number(barangay_id));
    }

    if (abuse_name) {
        query += ' AND abuse_name = ?';
        params.push(abuse_name);
    }

    query += ' ORDER BY reported_at DESC';

    const [rows] = await conn.execute<ReportRow[]>(query, params);
    await conn.end();
    sendSuccess(res, 200, 'Reports retrieved successfully', rows);
};

export const getReportById = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, 'Invalid report ID format');
        return;
    }

    const conn = await getConn();
    const [result]: any = await conn.execute('CALL sp_report_get(?)', [id]);
    await conn.end();

    const rows: ReportRow[] = result[0];
    if (!rows || rows.length === 0) {
        sendError(res, 404, 'Report not found');
        return;
    }

    sendSuccess(res, 200, 'Report retrieved successfully', rows[0]);
};

export const createReport = async (req: AuthRequest, res: Response) => {
    const { victim_id, offender_id, abuse_name, barangay_id, latitude, longitude, report_description } = req.body;

    if (!victim_id || !abuse_name || !barangay_id || latitude == null || longitude == null) {
        sendError(res, 400, 'Missing required fields: victim_id, abuse_name, barangay_id, latitude, longitude');
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [result]: any = await conn.execute(
            'CALL sp_report_create(?, ?, ?, ?, ?, ?, ?)',
            [
                victim_id,
                offender_id || null,
                abuse_name,
                barangay_id,
                latitude,
                longitude,
                report_description || null
            ]
        );

        const reportId = result[0][0]?.new_report_id;

        getIo()?.emit('report:new', {
            report_id: reportId,
            barangay_id,
            abuse_name,
            latitude,
            longitude,
            reported_at: new Date().toISOString()
        });

        sendSuccess(res, 201, 'Report created successfully', { report_id: reportId });
    } catch (err: any) {
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage);
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

export const updateReport = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { offender_id, report_description, latitude, longitude } = req.body;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, 'Invalid report ID format');
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [rows] = await conn.execute<ReportRow[]>(
            'SELECT report_id FROM vw_report WHERE report_id = ?',
            [id]
        );

        if (rows.length === 0) {
            sendError(res, 404, 'Report not found');
            return;
        }

        await conn.execute(
            'CALL sp_report_update(?, ?, ?, ?, ?)',
            [
                id,
                offender_id ?? null,
                report_description ?? null,
                latitude ?? null,
                longitude ?? null
            ]
        );

        sendSuccess(res, 200, 'Report updated successfully', null);
    } catch (err: any) {
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage);
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

export const updateReportStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { new_status } = req.body;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, 'Invalid report ID format');
        return;
    }

    if (!new_status || !VALID_STATUSES.includes(new_status as ReportStatus)) {
        sendError(res, 400, `Invalid or missing new_status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [rows] = await conn.execute<ReportRow[]>(
            'SELECT report_id FROM vw_report WHERE report_id = ?',
            [id]
        );

        if (rows.length === 0) {
            sendError(res, 404, 'Report not found');
            return;
        }

        await conn.execute(
            'CALL sp_report_update_status(?, ?, ?)',
            [id, new_status, req.user!.staff_id]
        );

        sendSuccess(res, 200, 'Report status updated successfully', null);
    } catch (err: any) {
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage);
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, 'Invalid report ID format');
        return;
    }

    let conn;
    try {
        conn = await getConn();
        const [result]: any = await conn.execute('CALL sp_report_delete(?)', [id]);
        const rowsAffected = result[0][0]?.rows_affected;

        if (!rowsAffected || rowsAffected === 0) {
            sendError(res, 404, 'Report not found');
            return;
        }

        sendSuccess(res, 200, 'Report deleted successfully', null);
    } catch (err: any) {
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage);
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

export const getReportStatusHistory = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, 'Invalid report ID format');
        return;
    }

    const conn = await getConn();
    const [result]: any = await conn.execute('CALL sp_report_status_history_get(?)', [id]);
    await conn.end();

    sendSuccess(res, 200, 'Report status history retrieved successfully', result[0]);
};
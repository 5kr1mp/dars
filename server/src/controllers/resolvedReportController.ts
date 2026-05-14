import type { Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../config/types.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/reports/:id/resolve
 * Body: { resolution_summary? }
 * Marks a report as resolved. Trigger automatically sets report.report_status = 'Resolved'.
 */
export const resolveReport = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { resolution_summary } = req.body;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, "Invalid report ID format");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [reportRows] = await conn.execute<RowDataPacket[]>(
            "SELECT barangay_id FROM report WHERE id = ?",
            [id]
        );
        if (reportRows.length === 0) {
            sendError(res, 404, "Report not found");
            return;
        }

        if (req.user?.user_role === "operator" &&
            (reportRows[0] as any).barangay_id !== req.user.barangay_id) {
            sendError(res, 404, "Report not found");
            return;
        }

        await conn.execute(
            `INSERT INTO resolved_report (report_id, operator_id, resolution_summary)
             VALUES (?, ?, ?)`,
            [id, req.user!.staff_id, resolution_summary ?? null]
        );

        sendSuccess(res, 201, "Report resolved", {
            report_id: id,
            resolved_by: req.user!.staff_id
        });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Report is already resolved");
            return;
        }
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage);
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

/**
 * GET /api/reports/:id/resolved
 * Returns the resolved_report record + resolver details for a given report.
 */
export const getResolvedReport = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, "Invalid report ID format");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        if (req.user?.user_role === "operator") {
            const [own] = await conn.execute<RowDataPacket[]>(
                "SELECT 1 FROM report WHERE id = ? AND barangay_id = ?",
                [id, req.user.barangay_id ?? -1]
            );
            if (own.length === 0) {
                sendError(res, 404, "Report not found");
                return;
            }
        }

        const [rows] = await conn.execute<RowDataPacket[]>(
            "SELECT * FROM vw_resolved_report WHERE report_id = ?",
            [id]
        );

        if (rows.length === 0) {
            sendError(res, 404, "Report is not resolved");
            return;
        }
        sendSuccess(res, 200, "Resolved report retrieved successfully", rows[0]);
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

/**
 * DELETE /api/reports/:id/resolve
 * Unresolves a report. Trigger reverts report_status back to 'Under Investigation'.
 */
export const unresolveReport = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!UUID_REGEX.test(id)) {
        sendError(res, 400, "Invalid report ID format");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        if (req.user?.user_role === "operator") {
            const [own] = await conn.execute<RowDataPacket[]>(
                "SELECT 1 FROM report WHERE id = ? AND barangay_id = ?",
                [id, req.user.barangay_id ?? -1]
            );
            if (own.length === 0) {
                sendError(res, 404, "Report not found");
                return;
            }
        }

        const [result] = await conn.execute<ResultSetHeader>(
            "DELETE FROM resolved_report WHERE report_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            sendError(res, 404, "Report is not resolved");
            return;
        }

        sendSuccess(res, 200, "Report resolution removed", null);
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

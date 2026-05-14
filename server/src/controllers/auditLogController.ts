import type { Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../config/types.js";

const VALID_ACTIONS = ["INSERT", "UPDATE", "DELETE"];

/**
 * GET /api/audit-log
 * Query: table_name, action_type, performed_by, from (ISO), to (ISO), limit, offset
 * system_admin only.
 */
export const getAuditLog = async (req: AuthRequest, res: Response) => {
    const { table_name, action_type, performed_by, from, to } = req.query;
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    if (action_type && !VALID_ACTIONS.includes(String(action_type).toUpperCase())) {
        sendError(res, 400, `Invalid action_type. Must be one of: ${VALID_ACTIONS.join(", ")}`);
        return;
    }
    if (performed_by && isNaN(Number(performed_by))) {
        sendError(res, 400, "performed_by must be a number");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        let query = `SELECT log_id, action_timestamp, table_name, action_type,
                            record_id, performed_by, user_role, old_values, new_values
                     FROM vw_audit_log
                     WHERE 1=1`;
        const params: any[] = [];

        if (table_name) {
            query += " AND table_name = ?";
            params.push(table_name);
        }
        if (action_type) {
            query += " AND action_type = ?";
            params.push(String(action_type).toUpperCase());
        }
        if (performed_by) {
            query += " AND performed_by = (SELECT fn_full_name(first_name, middle_name, last_name) FROM staff WHERE id = ?)";
            params.push(Number(performed_by));
        }
        if (from) {
            query += " AND action_timestamp >= ?";
            params.push(from);
        }
        if (to) {
            query += " AND action_timestamp <= ?";
            params.push(to);
        }

        query += ` ORDER BY action_timestamp DESC LIMIT ${limit} OFFSET ${offset}`;

        const [rows] = await conn.execute<RowDataPacket[]>(query, params);
        sendSuccess(res, 200, "Audit log retrieved successfully", rows);
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

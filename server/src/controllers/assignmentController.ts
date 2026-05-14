import type { Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../config/types.js";

export const assignOperatorBarangay = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { barangay_id } = req.body;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid staff ID");
        return;
    }
    if (barangay_id == null || isNaN(Number(barangay_id))) {
        sendError(res, 400, "barangay_id is required and must be a number");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [staffRows] = await conn.execute<RowDataPacket[]>(
            "SELECT user_role FROM staff WHERE id = ?",
            [id]
        );
        if (staffRows.length === 0) {
            sendError(res, 404, "Staff member not found");
            return;
        }
        if ((staffRows[0] as any).user_role !== "operator") {
            sendError(res, 400, "Only operators can be assigned to a barangay");
            return;
        }

        const [bRows] = await conn.execute<RowDataPacket[]>(
            "SELECT id FROM barangay WHERE id = ?",
            [Number(barangay_id)]
        );
        if (bRows.length === 0) {
            sendError(res, 404, "Barangay not found");
            return;
        }

        await conn.execute<ResultSetHeader>(
            "UPDATE staff SET barangay_id = ? WHERE id = ?",
            [Number(barangay_id), Number(id)]
        );

        sendSuccess(res, 200, "Operator assigned to barangay", {
            staff_id: Number(id),
            barangay_id: Number(barangay_id)
        });
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

/**
 * Remove an operator's barangay assignment.
 * DELETE /api/staff/:id/barangay
 */
export const unassignOperatorBarangay = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid staff ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();
        const [result] = await conn.execute<ResultSetHeader>(
            "UPDATE staff SET barangay_id = NULL WHERE id = ?",
            [Number(id)]
        );
        if (result.affectedRows === 0) {
            sendError(res, 404, "Staff member not found");
            return;
        }
        sendSuccess(res, 200, "Operator barangay assignment cleared", null);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

export const getOperatorsForBarangay = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid barangay ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();
        const [rows] = await conn.execute<RowDataPacket[]>(
            `SELECT staff_id, full_name, email, contact_number, barangay_id, barangay_name
             FROM vw_assigned_operator
             WHERE barangay_id = ?
             ORDER BY full_name`,
            [Number(id)]
        );
        sendSuccess(res, 200, "Operators retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        if (conn) await conn.end();
    }
};

import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { AuthRequest, Dispatch, DispatchStatus } from "../config/types.js";

interface DispatchRow extends RowDataPacket, Dispatch {}

const OPERATOR_SCOPE = ' AND report_id IN (SELECT id FROM report WHERE barangay_id = ?)';

const VALID_DISPATCH_STATUSES: DispatchStatus[] = [
    "Assigned",
    "On The Way",
    "Arrived",
    "Completed",
];

export async function createDispatch(req: Request, res: Response) {
    const { report_id, responder_id, remarks } = req.body;

    if (!report_id) {
        sendError(res, 400, "Report ID is required");
        return;
    }

    if (!responder_id) {
        sendError(res, 400, "Valid responder ID is required");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_dispatch_create(?, ?, ?)",
            [report_id, Number(responder_id), remarks ?? null]
        );

        const newId = (result as any)[0][0].new_dispatch_id;

        const NewDispatch = {
            id: newId,
            report_id,
            responder_id,
            remarks,
    
        }

        sendSuccess(res, 201, "Dispatch created successfully", NewDispatch);
    } catch (err: any) {
        if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
            sendError(res, 400, "Invalid report ID or responder ID");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getDispatches(req: AuthRequest, res: Response) {
    const conn = await getConn();
    try {
        let query = "SELECT * FROM vw_dispatch WHERE 1=1";
        const params: any[] = [];
        if (req.user?.user_role === "operator") {
            query += OPERATOR_SCOPE;
            params.push(req.user.barangay_id ?? -1);
        }
        query += " ORDER BY dispatch_time DESC";

        const [rows] = await conn.execute<DispatchRow[]>(query, params);
        sendSuccess(res, 200, "Dispatches retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getDispatchById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid dispatch ID");
        return;
    }

    const conn = await getConn();
    try {
        let query = "SELECT * FROM vw_dispatch WHERE dispatch_id = ?";
        const params: any[] = [Number(id)];
        if (req.user?.user_role === "operator") {
            query += OPERATOR_SCOPE;
            params.push(req.user.barangay_id ?? -1);
        }

        const [rows] = await conn.execute<DispatchRow[]>(query, params);
        if (!rows || rows.length === 0) {
            sendError(res, 404, "Dispatch not found");
            return;
        }

        sendSuccess(res, 200, "Dispatch retrieved successfully", rows[0]);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getDispatchesByReport(req: AuthRequest, res: Response) {
    const { report_id } = req.params;

    if (!report_id) {
        sendError(res, 400, "Report ID is required");
        return;
    }

    const conn = await getConn();
    try {
        let query = "SELECT * FROM vw_dispatch WHERE report_id = ?";
        const params: any[] = [report_id];
        if (req.user?.user_role === "operator") {
            query += OPERATOR_SCOPE;
            params.push(req.user.barangay_id ?? -1);
        }
        query += " ORDER BY dispatch_time DESC";

        const [rows] = await conn.execute<DispatchRow[]>(query, params);
        sendSuccess(res, 200, "Dispatches retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function updateDispatchStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { dispatch_status, remarks } = req.body;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid dispatch ID");
        return;
    }

    if (!dispatch_status) {
        sendError(res, 400, "Dispatch status is required");
        return;
    }

    if (!VALID_DISPATCH_STATUSES.includes(dispatch_status)) {
        sendError(res, 400, `Status must be one of: ${VALID_DISPATCH_STATUSES.join(", ")}`);
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_dispatch_update_status(?, ?, ?)",
            [Number(id), dispatch_status, remarks ?? null]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Dispatch not found");
            return;
        }

        sendSuccess(res, 200, "Dispatch status updated successfully", null);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function deleteDispatch(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid dispatch ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_dispatch_delete(?)",
            [Number(id)]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Dispatch not found");
            return;
        }

        sendSuccess(res, 200, "Dispatch deleted successfully", null);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}
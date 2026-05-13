import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { Dispatch, DispatchStatus } from "../config/types.js";

interface DispatchRow extends RowDataPacket, Dispatch {}

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

export async function getDispatches(req: Request, res: Response) {
    const conn = await getConn();
    try {
        const [result] = await conn.execute<DispatchRow[][]>(
            "CALL sp_dispatch_get(?)",
            [null]
        );

        const rows = result[0];
        sendSuccess(res, 200, "Dispatches retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getDispatchById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid dispatch ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute<DispatchRow[][]>(
            "CALL sp_dispatch_get(?)",
            [Number(id)]
        );

        const rows = result[0];
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

export async function getDispatchesByReport(req: Request, res: Response) {
    const { report_id } = req.params;

    if (!report_id) {
        sendError(res, 400, "Report ID is required");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute<DispatchRow[][]>(
            "CALL sp_dispatch_get_by_report(?)",
            [report_id]
        );

        const rows = result[0];
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
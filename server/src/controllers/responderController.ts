import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

interface ResponderRow extends RowDataPacket {
    responder_id: number;
    responder_name: string;
    agency: string | null;
    contact_number: string | null;
    total_dispatches: number;
    completed_dispatches: number;
}

export const getAllResponders = async (req: Request, res: Response) => {
    const { search, agency } = req.query;

    let conn;
    try {
        conn = await getConn();

        let query = "SELECT * FROM vw_responder WHERE 1=1";
        const params: any[] = [];

        if (search) {
            query += " AND responder_name LIKE ?";
            params.push(`%${search}%`);
        }

        if (agency) {
            query += " AND agency LIKE ?";
            params.push(`%${agency}%`);
        }

        query += " ORDER BY responder_name";

        const [rows] = await conn.execute<ResponderRow[]>(query, params);
        sendSuccess(res, 200, "Responders retrieved successfully", rows);
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

export const getResponderById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid responder ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [rows] = await conn.execute<ResponderRow[]>(
            "CALL sp_responder_get(?)",
            [id]
        );

        const responder = (rows as any)[0][0];
        if (!responder) {
            sendError(res, 404, "Responder not found");
            return;
        }

        sendSuccess(res, 200, "Responder retrieved successfully", responder);
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

export const createResponder = async (req: Request, res: Response) => {
    const { responder_name, agency, contact_number } = req.body;

    if (!responder_name) {
        sendError(res, 400, "Missing required field: responder_name");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [result]: any = await conn.execute(
            "CALL sp_responder_create(?, ?, ?)",
            [
                responder_name.trim(),
                agency?.trim() || null,
                contact_number || null,
            ]
        );

        const newId = result[0][0].new_responder_id;
        sendSuccess(res, 201, "Responder created successfully", { id: newId, responder_name, agency: agency || null, contact_number: contact_number || null });
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

export const updateResponder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { responder_name, agency, contact_number } = req.body;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid responder ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [rows] = await conn.execute<ResponderRow[]>(
            "SELECT responder_id FROM vw_responder WHERE responder_id = ?",
            [id]
        );

        if (rows.length === 0) {
            sendError(res, 404, "Responder not found");
            return;
        }

        await conn.execute(
            "CALL sp_responder_update(?, ?, ?, ?)",
            [
                id,
                responder_name?.trim() || null,
                agency?.trim() || null,
                contact_number || null,
            ]
        );

        sendSuccess(res, 200, "Responder updated successfully", null);
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

export const deleteResponder = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid responder ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [result]: any = await conn.execute(
            "CALL sp_responder_delete(?)",
            [id]
        );

        const affectedRows = result[0][0].rows_affected;
        if (affectedRows === 0) {
            sendError(res, 404, "Responder not found");
            return;
        }

        sendSuccess(res, 200, "Responder deleted successfully", null);
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
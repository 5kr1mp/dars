import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

interface VictimRow extends RowDataPacket {
    victim_id: number;
    full_name: string;
    contact_number: string | null;
    email: string | null;
    address: string | null;
    barangay_name: string | null;
    created_at: string;
}

export const getAllVictims = async (req: Request, res: Response) => {
    const { search } = req.query;

    let conn;
    try {
        conn = await getConn();

        let query = "SELECT * FROM vw_victim WHERE 1=1";
        const params: any[] = [];

        if (search) {
            query += " AND (full_name LIKE ? OR email LIKE ? OR contact_number LIKE ?)";
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        query += " ORDER BY full_name";

        const [rows] = await conn.execute<VictimRow[]>(query, params);
        sendSuccess(res, 200, "Victims retrieved successfully", rows);
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

export const getVictimById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid victim ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [result]: any = await conn.execute("CALL sp_victim_get(?)", [id]);
        const victim = result[0][0];

        if (!victim) {
            sendError(res, 404, "Victim not found");
            return;
        }

        sendSuccess(res, 200, "Victim retrieved successfully", victim);
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

export const createVictim = async (req: Request, res: Response) => {
    const {
        first_name,
        middle_name,
        last_name,
        contact_number,
        email,
        barangay_id,
        address,
    } = req.body;

    if (!first_name || !last_name) {
        sendError(res, 400, "Missing required fields: first_name, last_name");
        return;
    }

    if (!contact_number && !email) {
        sendError(res, 400, "At least one of contact_number or email is required");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [result]: any = await conn.execute(
            "CALL sp_victim_create(?, ?, ?, ?, ?, ?, ?)",
            [
                first_name.trim(),
                middle_name?.trim() || null,
                last_name.trim(),
                contact_number || null,
                email?.trim().toLowerCase() || null,
                barangay_id || null,
                address?.trim() || null,
            ]
        );

        const newId = result[0][0].new_victim_id;
        sendSuccess(res, 201, "Victim created successfully", { id: newId });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Email already exists");
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

export const updateVictim = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        first_name,
        middle_name,
        last_name,
        contact_number,
        email,
        barangay_id,
        address,
    } = req.body;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid victim ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [rows] = await conn.execute<VictimRow[]>(
            "SELECT victim_id FROM vw_victim WHERE victim_id = ?",
            [id]
        );

        if (rows.length === 0) {
            sendError(res, 404, "Victim not found");
            return;
        }

        await conn.execute(
            "CALL sp_victim_update(?, ?, ?, ?, ?, ?, ?, ?)",
            [
                id,
                first_name?.trim() || null,
                middle_name?.trim() || null,
                last_name?.trim() || null,
                contact_number || null,
                email?.trim().toLowerCase() || null,
                barangay_id || null,
                address?.trim() || null,
            ]
        );

        sendSuccess(res, 200, "Victim updated successfully", null);
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Email already exists");
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

export const deleteVictim = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid victim ID");
        return;
    }

    let conn;
    try {
        conn = await getConn();

        const [result]: any = await conn.execute("CALL sp_victim_delete(?)", [id]);
        const affectedRows = result[0][0].rows_affected;

        if (affectedRows === 0) {
            sendError(res, 404, "Victim not found");
            return;
        }

        sendSuccess(res, 200, "Victim deleted successfully", null);
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
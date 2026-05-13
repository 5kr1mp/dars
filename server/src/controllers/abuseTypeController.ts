import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { AbuseType } from "../config/types.js";

interface AbuseTypeRow extends RowDataPacket, AbuseType {}

export async function createAbuseType(req: Request, res: Response) {
    const { abuse_name, abuse_description, severity, law_reference } = req.body;

    if (!abuse_name) {
        sendError(res, 400, "Abuse name is required");
        return;
    }

    if (abuse_name.length > 20) {
        sendError(res, 400, "Abuse name must be 20 characters or less");
        return;
    }

    if(!abuse_description){
        sendError(res, 400, "Abuse description is required");
        return;
    }

    if(!severity){
        sendError(res, 400, "Severity is required");
        return;
    }

    if(!law_reference){
        sendError(res, 400, "Law reference is required");
        return;
    }

    if (severity !== undefined && severity !== null) {
        if (isNaN(Number(severity)) || Number(severity) < 1 || Number(severity) > 10) {
            sendError(res, 400, "Severity must be a number between 1 and 10");
            return;
        }
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_abuse_type_create(?, ?, ?, ?)",
            [
                abuse_name.trim(),
                abuse_description ,
                severity,
                law_reference,
            ]
        );

        const createdName = (result as any)[0][0].created_abuse_name;

        sendSuccess(res, 201, "Abuse type created successfully", {
            abuse_name: createdName,
            abuse_description,
            severity,
            law_reference,
        });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Abuse type already exists");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getAbuseTypes(req: Request, res: Response) {
    const conn = await getConn();
    try {
        const [result] = await conn.execute<AbuseTypeRow[][]>(
            "CALL sp_abuse_type_get(?)",
            [null]
        );

        const rows = result[0];
        sendSuccess(res, 200, "Abuse types retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getAbuseTypeByName(req: Request, res: Response) {
    const { abuse_name } = req.params;

    if (!abuse_name) {
        sendError(res, 400, "Abuse name is required");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute<AbuseTypeRow[][]>(
            "CALL sp_abuse_type_get(?)",
            [abuse_name]
        );

        const rows = result[0];
        if (!rows || rows.length === 0) {
            sendError(res, 404, "Abuse type not found");
            return;
        }

        sendSuccess(res, 200, "Abuse type retrieved successfully", rows[0]);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function updateAbuseType(req: Request, res: Response) {
    const { abuse_name } = req.params;
    const { abuse_description, severity, law_reference } = req.body;

    if (!abuse_name) {
        sendError(res, 400, "Abuse name is required");
        return;
    }

    if (
        abuse_description === undefined &&
        severity === undefined &&
        law_reference === undefined
    ) {
        sendError(res, 400, "At least one field must be provided to update");
        return;
    }

    if (severity !== undefined && severity !== null) {
        if (isNaN(Number(severity)) || Number(severity) < 1 || Number(severity) > 10) {
            sendError(res, 400, "Severity must be a number between 1 and 10");
            return;
        }
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_abuse_type_update(?, ?, ?, ?)",
            [
                abuse_name,
                abuse_description ?? null,
                severity ?? null,
                law_reference ?? null,
            ]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Abuse type not found or no changes made");
            return;
        }

        sendSuccess(res, 200, "Abuse type updated successfully", null);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function deleteAbuseType(req: Request, res: Response) {
    const { abuse_name } = req.params;

    if (!abuse_name) {
        sendError(res, 400, "Abuse name is required");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_abuse_type_delete(?)",
            [abuse_name]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Abuse type not found");
            return;
        }

        sendSuccess(res, 200, "Abuse type deleted successfully", null);
    } catch (err: any) {
        if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
            sendError(res, 409, "Cannot delete: abuse type is still referenced by reports");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}
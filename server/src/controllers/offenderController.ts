import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { Offender, sex } from "../config/types.js";

interface OffenderRow extends RowDataPacket, Offender {}

const VALID_SEX: sex[] = ["Male", "Female", "Other"];

export async function createOffender(req: Request, res: Response) {
    const {
        first_name,
        middle_name,
        last_name,
        sex,
        contact_number,
        address,
        barangay_id,
    } = req.body;

    if (!first_name) {
        sendError(res, 400, "First name is required");
        return;
    }

    if (sex !== undefined && sex !== null && !VALID_SEX.includes(sex)) {
        sendError(res, 400, `Sex must be one of: ${VALID_SEX.join(", ")}`);
        return;
    }

    if (barangay_id !== undefined && barangay_id !== null && isNaN(Number(barangay_id))) {
        sendError(res, 400, "Invalid barangay ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_offender_create(?, ?, ?, ?, ?, ?, ?)",
            [
                first_name,
                middle_name ?? null,
                last_name ?? null,
                sex ?? null,
                contact_number ?? null,
                address ?? null,
                barangay_id ?? null,
            ]
        );

        const newId = (result as any)[0][0].new_offender_id;

        sendSuccess(res, 201, "Offender created successfully", {
            id: newId,
            first_name,
            middle_name,
            last_name,
            sex,
            contact_number,
            address,
            barangay_id,
        });
    } catch (err: any) {
        if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
            sendError(res, 400, "Invalid barangay ID");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getOffenders(req: Request, res: Response) {
    const conn = await getConn();
    try {
        const [result] = await conn.execute<OffenderRow[][]>(
            "CALL sp_offender_get(?)",
            [null]
        );

        const rows = result[0];
        sendSuccess(res, 200, "Offenders retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getOffenderById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid offender ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute<OffenderRow[][]>(
            "CALL sp_offender_get(?)",
            [Number(id)]
        );

        const rows = result[0];
        if (!rows || rows.length === 0) {
            sendError(res, 404, "Offender not found");
            return;
        }

        sendSuccess(res, 200, "Offender retrieved successfully", rows[0]);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function updateOffender(req: Request, res: Response) {
    const { id } = req.params;
    const {
        first_name,
        middle_name,
        last_name,
        sex,
        contact_number,
        address,
        barangay_id,
    } = req.body;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid offender ID");
        return;
    }

    if (
        first_name === undefined &&
        middle_name === undefined &&
        last_name === undefined &&
        sex === undefined &&
        contact_number === undefined &&
        address === undefined &&
        barangay_id === undefined
    ) {
        sendError(res, 400, "At least one field must be provided to update");
        return;
    }

    if (sex !== undefined && sex !== null && !VALID_SEX.includes(sex)) {
        sendError(res, 400, `Sex must be one of: ${VALID_SEX.join(", ")}`);
        return;
    }

    if (barangay_id !== undefined && barangay_id !== null && isNaN(Number(barangay_id))) {
        sendError(res, 400, "Invalid barangay ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_offender_update(?, ?, ?, ?, ?, ?, ?, ?)",
            [
                Number(id),
                first_name ?? null,
                middle_name ?? null,
                last_name ?? null,
                sex ?? null,
                contact_number ?? null,
                address ?? null,
                barangay_id ?? null,
            ]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Offender not found or no changes made");
            return;
        }

        sendSuccess(res, 200, "Offender updated successfully", null);
    } catch (err: any) {
        if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
            sendError(res, 400, "Invalid barangay ID");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function deleteOffender(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid offender ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_offender_delete(?)",
            [Number(id)]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Offender not found");
            return;
        }

        sendSuccess(res, 200, "Offender deleted successfully", null);
    } catch (err: any) {
        if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
            sendError(res, 409, "Cannot delete: offender is still referenced by reports");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}
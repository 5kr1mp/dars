import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { getConn } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { Barangay, CreateBarangay } from "../config/types.js";

interface BarangayRow extends RowDataPacket, Barangay {};

export async function createBarangay(req: Request, res: Response) {
    const { barangay_name, latitude, longitude, radius } = req.body;

    if (!barangay_name) {
        sendError(res, 400, "Barangay name is required");
        return;
    }

    if (latitude !== undefined && latitude !== null && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
        sendError(res, 400, "Invalid latitude value");
        return;
    }

    if (longitude !== undefined && longitude !== null && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
        sendError(res, 400, "Invalid longitude value");
        return;
    }

    if (radius !== undefined && radius !== null && (isNaN(Number(radius)) || Number(radius) <= 0)) {
        sendError(res, 400, "Invalid radius value");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_barangay_create(?, ?, ?, ?)",
            [barangay_name, latitude ?? null, longitude ?? null, radius ?? null]
        );

        const newId = (result as any)[0][0].new_barangay_id;

        const NewBarangay = {
            newId,
            barangay_name,
            latitude,
            longitude,
            radius,
        };

        sendSuccess(res, 201, "Barangay created successfully",NewBarangay );
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Barangay already exists");
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getBarangays(req: Request, res: Response) {
    const conn = await getConn();
    try {
        const [result] = await conn.execute<BarangayRow[][]>(
            "CALL sp_barangay_get(?)",
            [null]
        );

        const rows = result[0];
        sendSuccess(res, 200, "Barangays retrieved successfully", rows);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function getBarangayById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid barangay ID");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute<BarangayRow[][]>(
            "CALL sp_barangay_get(?)",
            [Number(id)]
        );

        const rows = result[0];
        if (!rows || rows.length === 0) {
            sendError(res, 404, "Barangay not found");
            return;
        }

        sendSuccess(res, 200, "Barangay retrieved successfully", rows[0]);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}

export async function updateBarangay(req: Request, res: Response) {
    const { id } = req.params;
    const { barangay_name, latitude, longitude, radius } = req.body;

    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid barangay ID");
        return;
    }

    if (
        barangay_name === undefined &&
        latitude === undefined &&
        longitude === undefined &&
        radius === undefined
    ) {
        sendError(res, 400, "At least one field must be provided to update");
        return;
    }

    if (latitude !== undefined && latitude !== null && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
        sendError(res, 400, "Invalid latitude value");
        return;
    }

    if (longitude !== undefined && longitude !== null && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
        sendError(res, 400, "Invalid longitude value");
        return;
    }

    if (radius !== undefined && radius !== null && (isNaN(Number(radius)) || Number(radius) <= 0)) {
        sendError(res, 400, "Invalid radius value");
        return;
    }

    const conn = await getConn();
    try {
        const [result] = await conn.execute(
            "CALL sp_barangay_update(?, ?, ?, ?, ?)",
            [Number(id), barangay_name ?? null, latitude ?? null, longitude ?? null, radius ?? null]
        );

        const rowsAffected = (result as any)[0][0].rows_affected;
        if (rowsAffected === 0) {
            sendError(res, 404, "Barangay not found or no changes made");
            return;
        }

        sendSuccess(res, 200, "Barangay updated successfully", null);
    } catch (err: any) {
        sendError(res, 500, err.message);
    } finally {
        await conn.end();
    }
}
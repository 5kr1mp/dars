import type { AuthRequest, Staff } from "../config/types.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Request,Response,NextFunction} from "express";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess, sendResponse} from "../utils/response.js";
import { isUserRole, UserRoleEnum } from "../config/types.js";
import { hash, compareHash } from "../utils/hash.js";

interface StaffRow extends RowDataPacket, Staff{};

export const getAllStaff = async (req : Request, res : Response) => {
    const {search,role} = req.query

    const conn = await getConn();
    let query = 'select staff_id, email, full_name, user_role, contact_number from vw_staff where 1=1';
    const params : any[] = [];

    // search by email or full name
    if (search){
        query += ' and (email like ? or full_name like ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    // search by role
    if (role && typeof role === "string"){
        if (!Object.values(UserRoleEnum).includes(role as UserRoleEnum)){
            sendError(res,400,"Invalid role");
            return;
        }
        query += ' and user_role = ?';
        params.push(role);
    }

    const [rows] = await conn.execute(query, params);
    sendSuccess(res,200,"Staff members retrieved successfully", rows);
}

export const getStaffById = async (req : Request, res : Response) => {
    const {id} = req.params;

    // validate id params
    if (!id || isNaN(Number(id))){
        sendError(res,400,"Invalid staff ID");
        return;
    }
    
    const conn = await getConn();
    const [rows] = await conn.execute<StaffRow[]>(
        'select staff_id, email, full_name, user_role, contact_number from vw_staff where staff_id=?',
        [id]
    );

    //no staff found
    const staff = rows[0];
    if (!staff){
        sendError(res,404,"Staff member not found");
        return;
    }

    sendSuccess(res,200,"Staff member retrieved successfully", staff);
}

/**
 * 
 * Get own profile based on the the attached 'user'
 * property from the authentication middleware. 
 * This will return the staff details of the currently authenticated user.
 * 
 * @param req Request object with attached user property
 * @param res 
 */
export const getMe = async (req : AuthRequest, res : Response) => {
    const user = req.user;
    
    const conn = await getConn();
    const [rows] = await conn.execute<StaffRow[]>(
        'select staff_id, email, full_name, user_role, contact_number from vw_staff where staff_id=?',
        [user!.staff_id]
    );

    const staff = rows[0];
    if (!staff){
        sendError(res,404,"Staff account was deleted while token is still valid");
        return;
    }

    conn.end()
    sendSuccess(res,200,"Staff member retrieved successfully", staff);  
}

export const createStaff = async(req : Request, res : Response) => {
    const {
        email,
        pw : password,
        firstName,
        lastName,
        middleName,
        userRole,
        contact_number
    } = req.body;

    // check required fields
    if (!email || !password || !firstName || !lastName || !userRole){
        sendError(res, 400, "Missing required fields: email, pw, firstName, lastName, userRole");
        return;
    }

    // validate role
    if (!isUserRole(userRole)){
        sendError(res, 400, "Invalid role");
        return;
    }

    if (password.length < 8){
        sendError(res, 400, "Password must be at least 8 characters");
        return;
    }

    let conn
    try {
        const hashedPw = await hash(password);

        conn = await getConn();

        const [result]:any = await conn.execute(
            'CALL sp_staff_create(?, ?, ?, ?, ?, ?, ?)',
            [
                email.trim().toLowerCase(),
                hashedPw,
                firstName.trim(),
                middleName?.trim() || null,
                lastName.trim(),
                userRole,
                contact_number || null
            ]
        );

        const newStaff = {
            staff_id: result[0]?.[0]?.id,
            email,
            firstName,
            lastName,
            middleName,
            role: userRole,
            contactNumber: contact_number || null
        };

        sendSuccess(res, 201, "Signup successful", newStaff);
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Email already exists");
            return;
        }
        
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage)
            return;
        }
        sendError(res, 500, err.message);
    } finally {
        if (conn){
            await conn.end();
        }
    }
}

export const updateStaff = async (req : AuthRequest, res : Response) => {
    const { id } = req.params;
    const {
        email,
        firstName,
        lastName,
        middleName,
        userRole,
        contact_number
    } = req.body;

    // validate id params
    if (!id || isNaN(Number(id))) {
        sendError(res, 400, "Invalid staff ID");
        return;
    }

    let conn;
    try {
        // If updating role, must be an admin or system admin
        if (userRole && !isUserRole(userRole)) {
            sendError(res, 400, "Invalid role")
            return;
        }

        conn = await getConn();

        const [rows] = await conn.execute<StaffRow[]>(
            'SELECT staff_id FROM vw_staff WHERE staff_id = ?',
            [id]
        );

        // if staff exist
        if (rows.length === 0) {
            sendError(res, 404, "Staff member not found");
            return;
        }

        // Call stored procedure to update staff
        const [result]: any = await conn.execute(
            'CALL sp_staff_update(?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                email?.trim().toLowerCase() || null,
                firstName?.trim() || null,
                middleName?.trim() || null,
                lastName?.trim() || null,
                userRole || null,
                contact_number || null
            ]
        );

        sendSuccess(res, 200, "Staff member updated successfully", null);
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Email already exists");
            return;
        }

        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage)
            return;
        }
        sendError(res, 500, err.message)
    } finally {
        if (conn){
            await conn.end();
        }
    }
}

/**
 * Change password for the authenticated staff
 * Requires authentication and verifies old password before changing
 * 
 * @param req AuthRequest with user property from middleware
 * @param res 
 */
export const changePassword = async (req : AuthRequest, res : Response) => {
    const { oldPassword, newPassword } = req.body
    const user = req.user;

    // validate user is authenticated
    if (!user) {
        sendError(res, 401, "Unauthorized");
        return;
    }

    // validate required fields
    if (!oldPassword || !newPassword) {
        sendError(res, 400, "Missing required fields: oldPassword, newPassword")
        return;
    }

    // validate password length
    if (newPassword.length < 8) {
        sendError(res, 400, "New password must be at least 8 characters");
        return;
    }
    let conn;
    try {
        conn = await getConn();

        // Get current password hash
        const [rows]: any = await conn.execute(
            'SELECT password FROM staff WHERE id = ?',
            [user.staff_id]
        );

        if (rows.length === 0) {
            sendError(res, 404, "Staff account not found")
            return;
        }

        const currentPasswordHash = rows[0].password;

        // Verify old password
        const isPasswordValid = await compareHash(oldPassword, currentPasswordHash);
        if (!isPasswordValid) {
            sendError(res, 401, "Old password is incorrect")
            return;
        }

        // Hash new password
        const hashedNewPassword = await hash(newPassword);

        // Update password using stored procedure
        await conn.execute(
            'CALL sp_staff_change_password(?, ?)',
            [user.staff_id, hashedNewPassword]
        );

        sendSuccess(res, 200, "Password updated successfully", null)
    } catch (err: any) {
        if (err.sqlMessage) {
            sendError(res, 400, err.sqlMessage);
            return;
        }
        sendError(res, 500, err.message)
    } finally {
        if (conn){
            await conn.end();
        }
    }
}

export const deleteStaff = async (req : AuthRequest, res : Response) => {
    const {id} = req.params;

    if (!id || isNaN(Number(id))){
        sendError(res,400,"Invalid staff ID")
        return
    }

    let conn;
    try {
        conn = await getConn();
    
        const [result] = await conn.execute<ResultSetHeader>(
            'DELETE FROM staff WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0){
            sendError(res,404,"Staff not found")
            return;
        }

        sendSuccess(res,204,"Staff successfully deleted",null)
        
    } catch (err : any){
        if (err.sqlMessage){
            sendError(res,400,err.sqlMessage)
            return
        }
        sendError(res,500,err.message)
    } finally {
        if (conn){
            await conn.end();
        }
    }

}
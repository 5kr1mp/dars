import type { AuthRequest, Staff } from "../config/types.js";
import type { RowDataPacket } from "mysql2";
import type { Request,Response,NextFunction} from "express";
import { getConn } from "../config/db.js";
import { sendError, sendSuccess, sendResponse} from "../utils/response.js";
import { UserRoleEnum } from "../config/types.js";

interface StaffRow extends RowDataPacket, Staff{};

export const getAllStaff = async (req : Request, res : Response) => {
    const {search,role} = req.query

    const conn = await getConn();
    let query = 'select id, email, full_name, role, contact_number from vw_staff where 1=1';
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
        query += ' and role = ?';
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
        'select id, email, full_name, role, contact_number from vw_staff where id=?',
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
        'select id, email, full_name, role, contact_number from vw_staff where id=?',
        [user!.staff_id]
    );

    const staff = rows[0];
    if (!staff){
        sendError(res,404,"Staff account was deleted while token is still valid");
        return;
    }

    sendSuccess(res,200,"Staff member retrieved successfully", staff);  
}

export const createStaff = async (req : Request, res : Response) => {
    const {
        email,
        password,
        firstName,
        lastName,
        middleName,
        userRole,
        contactNumber
    } = req.body;

    // check required fields
    if (!email || !password || !firstName || !lastName || !userRole){
        sendError(res, 400, "Missing required fields: email, password, firstName, lastName, userRole");
        return;
    }

    const conn = await getConn();

    try {
        const [result] = await conn.execute<RowDataPacket[][]>(
            'call sp_create_staff(?,?,?,?,?,?,?)',
            [email, password, firstName, middleName || null, lastName, userRole, contactNumber || null]
        );

        const createdStaff = (result as any)?.[0]?.[0] as Staff;
        sendSuccess(res, 201, "Staff member created successfully", createdStaff);
    } catch (error : any) {
        if (error.code === "ER_DUP_ENTRY"){
            sendError(res, 409, "Email already exists");
        } else {
            console.error("Error creating staff:", error);
            sendError(res, 500, "Internal Server Error");
        }
    } 
}
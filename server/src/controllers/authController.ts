import type { Request,Response } from "express"
import type { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { getConn } from "../config/db.js";
import { hash, compareHash } from "../utils/hash.js";
import { isUserRole, type JwtUserPayload, type UserRole} from "../config/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

interface PasswordRow extends RowDataPacket {
    id : number;
    first_name : string;
    middle_name : string | null;
    last_name : string;
    role : UserRole;
    password : string;  
}

export async function login(req : Request, res : Response) {
    const {email,password} = req.body;
    if (!email || !password){
        sendError(res, 400, "Email and password required");
        return;
    }

    const JWT_SECRET : jwt.Secret = process.env.JWT_SECRET || '';

    if (!JWT_SECRET){
        sendError(res, 500, "Missing JWT Secret");
        return;
    }

    const conn = await getConn();
    const [rows] = await conn.execute<PasswordRow[]>(
        'select id, first_name, middle_name, last_name, role, password from staff where email=?',
        [email.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
        sendError(res, 401, "Invalid email or password");
        return;
    }

    const valid = await compareHash(
        password.trim(),
        user.password
    );

    if (!valid) {
        sendError(res, 401, "Invalid email or password");
        return;
    }

    const payload : JwtUserPayload = {
        staff_id : user.id,
        user_role : user.role
    } 

    const token = jwt.sign(payload,JWT_SECRET,{
        expiresIn : "1d"
    })

    const {password : pw, ...safeUser} = user;
    
    sendSuccess(res, 200, "Login successful", { token, safeUser });
}

export async function register(req : Request, res : Response){
    const {
        email,
        pw : password,
        firstName,
        lastName,
        middleName,
        userRole,
        contactNumber
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

  try {
    const hashedPw = await hash(password);

    const conn = await getConn();
    
    const [result] = await conn.execute(
        `INSERT INTO staff (email, password, first_name, last_name, middle_name, user_role, contact_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, hashedPw, firstName, lastName, middleName || null, userRole, contactNumber || null]
    );

    const newStaff = {
        id: (result as any).insertId,
        email,
        firstName,
        lastName,
        middleName,
        role: userRole,
        contactNumber
    };

    sendSuccess(res, 201, "Signup successful", newStaff);
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            sendError(res, 409, "Email already exists");
            return;
        }
        sendError(res, 500, err.message);
    }
}

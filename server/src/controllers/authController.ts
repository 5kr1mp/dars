import type { Request,Response } from "express"
import type { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { getConn } from "../config/db.js";
import { hash, compareHash } from "../utils/hash.js";
import { isUserRole, type JwtUserPayload} from "../config/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

interface PasswordRow extends RowDataPacket {
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
    
    conn.end();
    sendSuccess(res, 200, "Login successful", { token, safe_user : safeUser });
}
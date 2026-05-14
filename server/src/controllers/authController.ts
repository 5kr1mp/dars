import type { Request,Response } from "express"
import type { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { getConn } from "../config/db.js";
import { hash, compareHash } from "../utils/hash.js";
import { isUserRole, type JwtUserPayload, type UserRole} from "../config/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

interface PasswordLookupResult extends RowDataPacket {
    id : number;
    email : string;
    password : string;
    user_role : string;
    first_name : string;
    last_name : string;
    barangay_id : number | null;
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
    const [results] : any = await conn.execute(
        'CALL sp_staff_login_lookup(?)',
        [email.trim().toLowerCase()]
    );

    const user = results[0][0] as PasswordLookupResult | undefined;

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
        user_role : user.user_role as UserRole,
        barangay_id : user.barangay_id
    }

    const token = jwt.sign(payload,JWT_SECRET,{
        expiresIn : "1d"
    })

    const {password : pw, ...safeUser} = user;
    
    conn.end();
    sendSuccess(res, 200, "Login successful", { token, safe_user : safeUser });
}

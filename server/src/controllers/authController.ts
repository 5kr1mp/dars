import type { NextFunction, Request,Response } from "express"
import type { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { getConn } from "../config/db.js";
import { hash, compareHash } from "../utils/hash.js";
import { isUserRole, type JwtUserPayload} from "../config/types.js";

interface PasswordRow extends RowDataPacket {
    password : string;
}

export async function login(req : Request, res : Response) {
    const {email,password} = req.body;
    if (!email || !password){
        res.status(400).json({error : "email and password required"});
        return;
    }

    const JWT_SECRET : jwt.Secret = process.env.JWT_SECRET || '';

    if (!JWT_SECRET){
        res.status(500).json({error : "Missing JWT Secret"})
        return;
    }

    const conn = await getConn();
    const [rows] = await conn.execute<PasswordRow[]>(
        'select id, first_name, middle_name, last_name, role, password from staff where email=?',
        [email.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
        res.status(401).json({
            error: 'Invalid email or password'
        });
        return;
    }

    const valid = await compareHash(
        password.trim(),
        user.password
    );

    if (!valid) {
        res.status(401).json({
            error: 'Invalid email or password'
        });
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
    
    res.status(200).json({token,safeUser})
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
        return res.status(400).json({error: "Missing some of the required fields : [email,pw,firstName,lastName,userRole]"})
    }

    // validate role
    if (!isUserRole(userRole)){
        return res.status(400).json({error : "Invalid role"})
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
        password: hashedPw,
        firstName,
        lastName,
        middleName,
        role: userRole,
        contactNumber
    };

        res.status(201).json({ message: "Signup successful", staff: newStaff });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
}

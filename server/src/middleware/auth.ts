import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtUserPayload,AuthRequest, UserRole } from "../config/types.js";
import { sendError } from "../utils/response.js";

export const authenticate = async (req : AuthRequest, res : Response, next : NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        sendError(res, 401, "Missing authorization header");
        return;
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        sendError(res, 401, "Missing authorization token");
        return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || '';
    if (!JWT_SECRET){
        sendError(res, 500, "Missing JWT Secret");
        return;
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload
        req.user = decoded
        next()
    } catch {
        sendError(res, 403, "Invalid or Expired Token");
    }
}

export const authorizeRole = (...allowedRoles : UserRole[]) => {
    return (req: AuthRequest, res: Response, next : NextFunction) => {
        if (!req.user){
            sendError(res,401,"Unauthorized")
            return;
        }

        if (!allowedRoles.includes(req.user.user_role)){
            sendError(res,403,"Forbidden")
        }

        next();
    }
}

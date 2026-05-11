import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtUserPayload,AuthRequest } from "../config/types.js";

export const authMiddleware = async (req : AuthRequest, res : Response, next : NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader){
        res.status(401).json({error : "Missing authorization header"})
        return
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        res.status(401).json({message : "Missing authorization token"})
        return
    }

    const JWT_SECRET = process.env.process || '';
    if (!JWT_SECRET){
        res.status(500).json({error : "Missing JWT Secret"})
        return;
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload
        req.user = decoded
        next()
    }
}
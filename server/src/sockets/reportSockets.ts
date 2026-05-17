import type { JwtUserPayload, ReportRow} from "../config/types.js";
import { Server } from "socket.io";
import jwt from 'jsonwebtoken';

let _io: Server;

export const initReportSockets = (io: Server) => {
    _io = io;

    // only staff can connect to socket
    io.use((socket,next) => {
        const token = socket.handshake.auth?.token

        if (!token) return next(new Error('Unauthorized'))

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!)
            socket.data.user = payload
            next()
        } catch {
            next (new Error('Unauthorized'))
        }
    });

    io.on("connection", (socket) => {

        const user = socket.data.user as JwtUserPayload;

        // operator joins barangay room
        if (user.barangay_id) socket.join(`barangay:${user.barangay_id}`)
        // admin 
        else socket.join('global') 
    });
};

export const getIo = (): Server => _io;
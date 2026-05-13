import { Server } from "socket.io";

let _io: Server;

export const initReportSockets = (io: Server) => {
    _io = io;

    io.on("connection", (socket) => {
        // clients can subscribe to a specific barangay room
        socket.on("join:barangay", (barangayId: number) => {
            socket.join(`barangay:${barangayId}`);
        });

        socket.on("leave:barangay", (barangayId: number) => {
            socket.leave(`barangay:${barangayId}`);
        });
    });
};

export const getIo = (): Server => _io;
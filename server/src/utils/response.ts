import type { Response } from "express";

export interface ApiResponse<T = any> {
    status: "error" | "success";
    message: string;
    data: T;
    code: number;
}

export const sendResponse = <T = any>(
    res: Response,
    statusCode: number,
    status: "error" | "success",
    message: string,
    data: T
) => {
    const response: ApiResponse<T> = {
        status,
        message,
        data,
        code: statusCode,
    };
    res.status(statusCode).json(response);
};

export const sendSuccess = <T = any>(
    res: Response,
    statusCode: number,
    message: string,
    data: T
) => {
    sendResponse(res, statusCode, "success", message, data);
};

export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    data: any = null
) => {
    sendResponse(res, statusCode, "error", message, data);
};

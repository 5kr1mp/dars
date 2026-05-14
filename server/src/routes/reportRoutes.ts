import { Router } from "express";
import {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    updateReportStatus,
    deleteReport,
    getReportStatusHistory
} from "../controllers/reportController.js";
import {
    resolveReport,
    unresolveReport,
    getResolvedReport
} from "../controllers/resolvedReportController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.route('/')
    .get(authenticate, getAllReports)
    .post(authenticate, createReport);

router.get('/:id/history', authenticate, getReportStatusHistory);

router.route('/:id/resolve')
    .post(authenticate, resolveReport)
    .delete(authenticate, unresolveReport);

router.get('/:id/resolved', authenticate, getResolvedReport);

router.route('/:id')
    .get(authenticate, getReportById)
    .put(authenticate, updateReport)
    .delete(authenticate, deleteReport);

router.patch('/:id/status', authenticate, updateReportStatus);

export default router;
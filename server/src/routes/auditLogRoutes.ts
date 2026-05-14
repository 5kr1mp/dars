import { Router } from "express";
import { getAuditLog } from "../controllers/auditLogController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRole("system_admin"), getAuditLog);

export default router;

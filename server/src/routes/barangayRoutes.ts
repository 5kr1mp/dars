import { Router } from "express";
import {
    createBarangay,
    getBarangays,
    getBarangayById,
    updateBarangay,
} from "../controllers/barangayController.js";
import { getOperatorsForBarangay } from "../controllers/assignmentController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.route("/")
.get(getBarangays)
.post(authenticate, authorizeRole("system_admin", "admin"), createBarangay);

router.get("/:id/operators",
    authenticate, authorizeRole("system_admin", "admin"), getOperatorsForBarangay);

router.route("/:id")
.get(getBarangayById)
.put(authenticate, authorizeRole("system_admin", "admin"), updateBarangay);

export default router;

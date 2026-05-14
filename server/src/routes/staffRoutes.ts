import { Router } from "express";
import {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    changePassword
} from "../controllers/staffController.js";
import { authenticate,authorizeRole } from "../middleware/auth.js";

const router = Router();

router.route('/')
    .get(authenticate, authorizeRole("system_admin"), getAllStaff)
    .post(authenticate, authorizeRole("admin", "system_admin"), createStaff);

router.route('/:id')
    .get(authenticate, authorizeRole("admin", "system_admin"), getStaffById)
    .put(authenticate, authorizeRole("admin", "system_admin"), updateStaff)
    .delete(authenticate, authorizeRole("admin", "system_admin"), deleteStaff);

router.post('/change-password', authenticate, changePassword);

export default router;
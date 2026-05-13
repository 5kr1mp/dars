import { Router } from "express";
import {
    getAllVictims,
    getVictimById,
    createVictim,
    updateVictim,
    deleteVictim,
} from "../controllers/victimController.js";
import { authenticate, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.route("/")
    .get(authenticate, getAllVictims)
    .post(authenticate, authorizeRole("admin", "system_admin", "operator"), createVictim);

router.route("/:id")
    .get(authenticate, getVictimById)
    .patch(authenticate, authorizeRole("admin", "system_admin", "operator"), updateVictim)
    .delete(authenticate, authorizeRole("admin", "system_admin"), deleteVictim);

export default router;
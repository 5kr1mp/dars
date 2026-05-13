import { Router } from "express";
import {
    getAllResponders,
    getResponderById,
    createResponder,
    updateResponder,
    deleteResponder,
} from "../controllers/responderController.js";

const router = Router();

router.get("/", getAllResponders);
router.get("/:id", getResponderById);
router.post("/", createResponder);
router.patch("/:id", updateResponder);
router.delete("/:id", deleteResponder);

export default router;

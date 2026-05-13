import { Router } from "express";
import {
    createOffender,
    getOffenders,
    getOffenderById,
    updateOffender,
    deleteOffender,
} from "../controllers/offenderController.js";

const router = Router();

router.route("/")
    .get(getOffenders)
    .post(createOffender);

router.route("/:id")
    .get(getOffenderById)
    .put(updateOffender)
    .delete(deleteOffender);

export default router;
import { Router } from "express";
import {
    createDispatch,
    getDispatches,
    getDispatchById,
    getDispatchesByReport,
    updateDispatchStatus,
    deleteDispatch,
} from "../controllers/dispatchController.js";

const router = Router();

router.route("/")
    .get(getDispatches)
    .post(createDispatch);

router.route("/:id")
    .get(getDispatchById)
    .delete(deleteDispatch);

router.route("/:id/status")
    .put(updateDispatchStatus);

router.route("/report/:report_id")
    .get(getDispatchesByReport);

export default router;
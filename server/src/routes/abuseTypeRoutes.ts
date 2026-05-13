import { Router } from "express";
import {
    createAbuseType,
    getAbuseTypes,
    getAbuseTypeByName,
    updateAbuseType,
    deleteAbuseType,
} from "../controllers/abuseTypeController.js";

const router = Router();

router.route("/")
    .get(getAbuseTypes)
    .post(createAbuseType);

router.route("/:abuse_name")
    .get(getAbuseTypeByName)
    .put(updateAbuseType)
    .delete(deleteAbuseType);

export default router;
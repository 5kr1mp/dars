import { Router } from "express";
import { getConn } from "../config/db.js";

const router = Router();

router.route('/')
    .get( async (req,res) => {

        const conn = await getConn();

        const rows = await conn.query('SELECT * FROM vw_barangay');

        res.status(200).json(rows[0])
    })


export default router;
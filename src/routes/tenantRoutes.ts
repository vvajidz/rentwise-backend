import express from "express";
import { Router } from "express";
import { getTenantCurrentProperty } from "../controllers/tenant";
import { verify } from "crypto";
import { verifyToken } from "../middleware/getme";


const router = Router();

router.get("/myProperty",verifyToken,getTenantCurrentProperty);





export default router;

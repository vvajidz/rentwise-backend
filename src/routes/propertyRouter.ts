import express from "express";
import { Router } from "express";
import {createProperty,properties, propertyId } from "../controllers/properties";
import { verifyRole } from "../middleware/verifyRole";


const router = Router();

router.post("/createproperty", verifyRole(["owner"]), createProperty);
router.get("/allproperty", properties);
router.get("/:id" , propertyId)




export default router;

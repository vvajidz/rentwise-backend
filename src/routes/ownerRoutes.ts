import express from "express";
import { Router } from "express";
import { verifyRole } from "../middleware/verifyRole";
import { confirmBookingRequest, declineRequest, getConfirmedTenants, getOwnerBookingRequests, getOwnerWithProperties, updateProperty } from "../controllers/owner";
import { verifyToken } from "../middleware/getme";


const router = Router();


router.get('/property/:ownerId',verifyRole(["owner"]),getOwnerWithProperties)
router.get('/property/accepted/request',verifyToken,getOwnerBookingRequests)
router.put("/property/request/:id/confirm", verifyToken, confirmBookingRequest);
router.patch("/property/edit/:propertyId",verifyRole(["owner"]),updateProperty);
router.get("/confirm/tenants", verifyToken, getConfirmedTenants);
router.delete("/delete/request/:requestId",verifyToken, declineRequest);







export default router;

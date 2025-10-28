import { Router } from "express"
import { createBookingRequest } from "../controllers/booking"
import { verifyToken } from "../middleware/getme"




const router = Router()

router.post('/request',verifyToken,createBookingRequest)

export default router;
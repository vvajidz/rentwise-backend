import { Router } from "express";
import { getMe, login, logout, signup, updateMe } from "../controllers/auth";
import { verifyToken } from "../middleware/getme";

const router = Router()

router.post("/signup" , signup)
router.post("/login", login)
router.post("/logout" , logout)
router.get("/me",verifyToken,getMe);
router.put("/userEdit",verifyToken,updateMe)



export default router
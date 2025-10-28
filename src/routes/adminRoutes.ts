import express from "express";
import {adminLogin,fetchUsers,getUsersByRole,userStatus} from "../controllers/admin";
import { verifyAdmin } from "../middleware/adminCheck";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users",verifyAdmin,fetchUsers)
router.get("/users/:role",verifyAdmin,getUsersByRole)
router.patch('/:userId/status' , userStatus)

export default router;

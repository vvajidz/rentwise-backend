"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controllers/admin");
const adminCheck_1 = require("../middleware/adminCheck");
const router = express_1.default.Router();
router.post("/login", admin_1.adminLogin);
router.get("/users", adminCheck_1.verifyAdmin, admin_1.fetchUsers);
router.get("/users/:role", adminCheck_1.verifyAdmin, admin_1.getUsersByRole);
router.patch('/:userId/status', admin_1.userStatus);
exports.default = router;

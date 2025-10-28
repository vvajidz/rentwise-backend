"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenant_1 = require("../controllers/tenant");
const getme_1 = require("../middleware/getme");
const router = (0, express_1.Router)();
router.get("/myProperty", getme_1.verifyToken, tenant_1.getTenantCurrentProperty);
exports.default = router;

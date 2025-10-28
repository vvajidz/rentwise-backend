"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_1 = require("../controllers/booking");
const getme_1 = require("../middleware/getme");
const router = (0, express_1.Router)();
router.post('/request', getme_1.verifyToken, booking_1.createBookingRequest);
exports.default = router;

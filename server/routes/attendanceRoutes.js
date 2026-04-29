
const express = require("express");
const { clockInOut,getAttendence } = require("../controllers/attendanceController");
const { protect } = require("../middelwere/auth");

const router = express.Router()


router.post("/",protect,clockInOut);
router.get('/',protect,getAttendence);

module.exports = router;

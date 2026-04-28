
const express = require("express");
const { createLeave, updateLeaveStatus, getLeaves } = require("../controllers/leaveController");
const { protect,protectAdmin } = require("../middelwere/auth");

const router = express.Router()

router.post('/',protect,createLeave)
router.get('/',protect,getLeaves)
router.patch('/:id',protect,protectAdmin,updateLeaveStatus)


module.exports = router;


const express = require("express");
const { protect,protectAdmin } = require("../middelwere/auth");
const { createPayslip, getPayslips, getPayslipsById } = require("../controllers/paySlipController");

const router = express.Router()

router.post('/',protect,protectAdmin,createPayslip)
router.get('/',protect,getPayslips)
router.get('/:id',protect,getPayslipsById)


module.exports = router;

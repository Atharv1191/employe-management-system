const express = require("express");
const { getEmployees, createEmployee, UpdateEmployee, DeleteEmployee } = require("../controllers/employyeController");
const { protect, protectAdmin } = require("../middelwere/auth");

const router = express.Router()

router.get('/',protect,protectAdmin,getEmployees);
router.post('/',protect,protectAdmin,createEmployee)
router.put('/:id',protect,protectAdmin,UpdateEmployee)
router.delete('/:id',protect,protectAdmin,DeleteEmployee)

module.exports = router

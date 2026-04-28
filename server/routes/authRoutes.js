const express = require("express");
const { login,session, changePassword } = require("../controllers/authController");
const { protect } = require("../middelwere/auth");

const router = express.Router()

router.post('/login',login);
router.get('/session',protect,session)
router.post('/change-password',protect,changePassword)


module.exports = router

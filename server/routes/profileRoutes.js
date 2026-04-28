const express = require("express");

const { protect } = require("../middelwere/auth");
const { getProfile, updateProfile } = require("../controllers/profileController");

const router = express.Router()

router.get('/',protect,getProfile);
router.post('/',protect,updateProfile)

module.exports = router

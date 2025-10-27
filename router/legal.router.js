const express = require("express");
const legalController = require("../controller/legal.controller");

const router = express.Router();

router.get("/imprint",legalController.showImprint);
router.get("/privacy",legalController.showDGSVO);

module.exports = router;
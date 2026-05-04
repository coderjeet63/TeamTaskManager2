const express = require("express");

const { getOverview } = require("../controllers/dashboardController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/overview", getOverview);

module.exports = router;

const express = require("express");

const { searchUsers } = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/search", searchUsers);

module.exports = router;
